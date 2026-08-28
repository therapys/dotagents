---
name: signoz-investigating-alerts
description: >
  Diagnose why a SigNoz alert fired by correlating the alert's own signal
  with neighbor signals (error rate, latency, throughput, CPU/memory),
  traces, and logs around the fire window, and rank likely causes.
  Use whenever the user asks "why did this alert fire", "what caused
  alert X", "investigate this alert", "RCA for the alert that paged me",
  "what's wrong with [service]" in the context of a recent fire, or
  otherwise asks for a root-cause analysis of a firing or recently-fired
  alert. Read-only; does not modify any alert or notification.
argument-hint: <alert name or rule id> [time window]
---

# Alert Investigate

Diagnose why a SigNoz alert fired: correlate the alert's own signal with
neighbor signals around the fire window and surface a ranked list of likely
causes with evidence. Companion to `signoz-explaining-alerts` (explain
decodes the rule statically; investigate diagnoses a specific incident).

## Prerequisites

Needs SigNoz MCP tools (`signoz_get_alert`, `signoz_get_alert_history`,
`signoz_execute_builder_query`, `signoz_query_metrics`,
`signoz_search_traces`, `signoz_search_logs`, `signoz_get_trace_details`,
etc.). Confirm `signoz_*` tools are available before starting; if not, run
`signoz-mcp-setup` to initialize/repair the MCP connection. Without the
server there is no way to ground the analysis.

## When to use

Use when the user wants to:
- Understand why a specific alert fired.
- Find the root cause of a recent incident triggered by an alert.
- Correlate the alert's signal with related metrics, traces, and logs.
- Distinguish "real signal" fires from flapping or threshold-mistuning.

Do NOT use when the user wants to:
- Understand what an alert monitors → `signoz-explaining-alerts`.
- Create a new alert → `signoz-creating-alerts`.
- Modify an alert (raise threshold, add hysteresis) → call
  `signoz_update_alert` directly.
- Run a free-form investigation with no alert anchor →
  `signoz-generating-queries`.

## Required inputs

| Input | Required | Source if missing |
|---|---|---|
| Alert identifier (rule ID or name) | yes | `$ARGUMENTS[0]` or recent context |
| Time window | no | default to most recent fire from `signoz_get_alert_history` |

Fuzzy alert name (best-effort, read-only):
1. Call `signoz_list_alert_rules`, paginate, fuzzy-match the name.
2. State the interpretation ("Investigating fire of 'High Error Rate -
   Checkout' (id 42) at 14:32 UTC. If you meant a different alert or fire,
   tell me.") and proceed.

If no firing transition exists in the queried lookback, **stop** — there is
nothing to investigate. Respond:
> "Alert '[name]' has not fired in the last 7d, so there is no fire window
> to investigate. Use `signoz-explaining-alerts` to walk through the rule,
> or check whether the alert is enabled."

## Workflow

Three tiers with strict early-stop gates. Tier 1 always runs; Tier 2 runs
only if Tier 1 confirms a real fire; Tier 3 runs only if Tier 2 surfaces
correlated anomalies. Skipping the gates fires hundreds of unnecessary
trace/log queries on quiet alerts.

### Step 1: Resolve alert + fire window (Tier 0)

1. Resolve the alert id via `signoz_list_alert_rules` (paginated) if not
   given.
2. Call `signoz_get_alert` for the full rule config (query, threshold,
   resource scope the alert evaluated).
3. Call `signoz_get_alert_history` with `timeRange: "7d"`, `order: "desc"`,
   and `state` omitted so the timeline includes firing and inactive
   transitions. Paginate only when `data.nextCursor` exists (completeness
   note reports `hasMore: true`): pass it as `cursor`, replace `timeRange`
   with the note's resolved absolute `start`/`end`, and preserve the same
   state/filter (including omission) and order. Stop when `nextCursor` is
   absent / `hasMore: false`; never use `offset` or page fullness. If a
   later intentional filter means "resolved"/"recovered", use `inactive`.
   Enum: `inactive|pending|recovering|firing|nodata|disabled`; `recovering`
   is a transient keep-firing state, not resolution. Pattern analysis needs
   the complete transition set. Rows are emitted per label-group
   `fingerprint`; do not interleave them. From the response:
   - **Build rule-wide incident windows** from distinct rows where
     `overallStateChanged: true`: `overallState: "firing"` opens an incident;
     the next `overallState: "inactive"` closes it. Deduplicate matching
     timestamps and sort by `unixMilli` ascending before pairing. Default to
     the most recent incident unless `$ARGUMENTS[1]` selects another.
   - **Partition affected series by `fingerprint`** and retain each row's
     labels. Use only `stateChanged: true` rows to decide when that group
     fired/resolved and which group scopes Tier 1–3 queries.
   - **Note the fire pattern** from rule-wide transitions or one named
     fingerprint:
     - `one-off` → single fire with a long quiet period before/after.
     - `sustained` → fires that stayed firing for ≥ 1 evaluation cycle.
     - `flapping` → ≥ 3 fires within a 1h window, alternating fire/resolve.
     - `recurring` → fires at regular intervals (cron-like, e.g. hourly).
   - Never infer flapping from different fingerprints. The pattern guides
     tiers 2/3.

### Step 2: Tier 1 — what fired and how hard (always runs)

Establishes the fire is real (vs. transient threshold tickle or flap) and
quantifies magnitude.

1. Re-run the alert's primary query over `[fire_start - 30m, fire_start +
   30m]` via `signoz_execute_builder_query` for the alert's stored builder,
   formula, PromQL, or ClickHouse envelope. Preserve positive bounds/order
   so Tier 1 reproduces the stored alert. If a formula input is below 10000,
   record truncation risk and compare at 10000 before ruling groups out. For
   omissions, use 10000 on formula-input `builder_query` leaves and 100 on
   standalone/formula results. Find leaves from every formula expression
   (including `disabled: true` formulas), following references through the
   dependency graph. This walk sets comparison bounds only; it does not prove
   deterministic formula-to-formula order. Use v5 `order`: `__result desc`
   for metrics/formulas or primary aggregation desc for logs/traces, never
   dashboard `orderBy`. Time-series top-N ranks over the whole window and may
   omit a short-lived local spike.
2. Compute:
   - **Peak value** during the fire window.
   - **Threshold breach magnitude**: `(peak - threshold) / threshold * 100`
     for "above" alerts, inverted for "below".
   - **Fire duration**: the rule's overall firing→inactive interval, or the
     selected fingerprint's interval for a group-scoped investigation. Say
     which.
   - **Pre-fire baseline**: average in the 30m before fire start.
3. **Early-stop gate**: if breach magnitude < 10% over threshold AND fire
   duration < 1 evaluation window, classify as "marginal fire" (alert may be
   too sensitive). Skip tiers 2/3 and go to Step 5 with a single hypothesis:
   "threshold may be too tight, recommend tuning."

### Step 3: Tier 2 — neighbor signals vs baseline (only if Tier 1 confirms a real breach)

Pull related signals for the alert's resource scope and compare fire window
to a baseline window.

1. **Pick a baseline window**: same hour, previous day (`fire_start - 24h,
   fire_start - 24h + fire_duration`). If the alert fired during a
   known-anomalous time (deploy, weekly job), note it but still proceed.
2. **Look up neighbor signals** for the alert's resource type — see
   `references/neighbor-signals.md`. Common cases:
   - **Service** (`service.name = X`): error rate, p95/p99 latency, request
     throughput, dependency error rates (if trace data available).
   - **Host / VM** (`host.name = X`): CPU, memory, disk I/O, network I/O.
   - **K8s pod / namespace**: pod restarts, container CPU/memory limits, node
     pressure, recent rollouts.
3. For each neighbor signal: query both windows via
   `signoz_execute_builder_query` or `signoz_query_metrics`, compute the
   delta (% change fire vs baseline), rank by absolute delta.
4. **Early-stop gate**: if no neighbor signal shows ≥ 25% deviation from
   baseline, classify as "isolated fire: the alert's own signal moved but
   nothing else did" (unusual, worth surfacing). Skip Tier 3 and go to Step 5
   with hypotheses focused on the alert's own query (likely causes: data
   source change, instrumentation change, downstream silent failure that only
   shows in this metric).

### Step 4: Tier 3 — traces and logs at the fire window (only if Tier 2 found correlated anomalies)

1. **Traces** (if service-scoped and traces available): call
   `signoz_search_traces` for the fire window with `service.name = <scope>`
   AND `has_error = true`, cap at top 20. Group by `name` and
   `status_message`; surface the sample's top 3 with one trace ID each (do
   not treat a 20-row sample count as full-window frequency). Optionally call
   `signoz_get_trace_details` for span attributes — pass the search row's
   `trace_id` as `traceId` **plus the same absolute fire-window `start` and
   `end`**, else the 6h default misses older incidents.
2. **Logs**: call `signoz_search_logs` with `<scope_filter>` AND
   `severity_text IN ('ERROR', 'FATAL')`, cap at top 20 most recent. Group by
   `body` pattern (or `exception.type` if present); surface the top 3
   distinct messages with counts.
3. **Cross-reference**: do the traces and logs point at the same downstream
   service, dependency, or code path? If so, that becomes the leading
   hypothesis.

See `references/baseline-comparison.md` for query templates that pair
fire-window and baseline-window calls cleanly.

### Step 5: Structured output

Use this exact section order. Lead with the TL;DR (engineers under pressure
scan the top and stop once they have what they need). Every claim cites the
MCP query that produced it; no generic "check logs / verify connectivity"
filler.

**1. TL;DR** — one or two sentences max: leading hypothesis, overall
confidence, blast radius, single most useful next action. Example:
> "checkoutservice error rate hit 12.4% (threshold 5%) for 8m at 14:32 UTC;
> most likely cause is payments-api timing out (high confidence). Open trace
> `7af3a09b…` to see the failing call."

If no hypothesis reaches medium confidence, lead with "No clear root cause
found." rather than a dressed-up low-confidence guess.

**2. What fired** — alert (id, name), fire window (absolute UTC + relative),
peak magnitude ("error rate hit 12.4% vs. 5% threshold, 148% over"), fire
duration, fire pattern (`one-off`/`sustained`/`flapping`/`recurring`/
`marginal`).

**3. Investigation trail** — scannable list of what was checked, ✅ for
confirmed and ❌ for ruled out, each with a one-line finding, e.g.:
- ✅ Tier 1: peak error rate 12.4%, fire was real (not marginal).
- ✅ Tier 2: payments error rate +8900%, p99 +1180%; downstream cascade.
- ❌ CPU / memory pressure: flat through the fire window.
- ✅ Tier 3: 30 error traces all hit payments-api, same message.

**4. Likely causes** (ranked, max 3) — each has:
- **Hypothesis**: one specific sentence. Bad: "service is unhealthy". Good:
  "checkout is timing out on calls to payments-api".
- **Evidence**: supporting numbers from tiers 1/2/3 with the underlying query
  inline (neighbor signal, delta vs baseline, trace/log pattern) so the user
  can re-run it.
- **Confidence**: `high` requires ≥2 of {temporal precedence, topology /
  dependency edge, shared service or entity, correlated metric/log/trace
  evidence, recent deploy or config change}. `medium` is one tier's evidence
  with ≥1 of those. `low` is a single signal with no corroboration — label it
  a "co-occurring signal," not a cause.

If only Tier 1 ran (marginal / no neighbor anomalies), output fewer
hypotheses at `low` confidence and call out the limitation.

**5. Ruled out** — short but explicit: candidates the evidence eliminated and
the one-line reason. Skip only if there is nothing meaningful; if you
considered and dropped something, say so here.

**6. Suggested next steps** — concrete, SigNoz-native handles the user can
act on immediately:
- Specific trace/dashboard/alert to open ("open trace `7af3a09b…` in the
  SigNoz UI").
- Specific query to run with `signoz-generating-queries`: paste the exact
  filter and time window.
- "Tune this alert" if marginal: name the field (`matchType`, `target`,
  `recoveryTarget`) and the change to make via `signoz_update_alert`.
- "Open an incident" / "page the owning team" if the cause is cross-service.

No generic filler ("verify connectivity", "check dashboards").

**Mirror up to 3** of these next steps as host follow-up intents: the most
actionable, alert-scoped ones. Keep the rest in the report prose (the chip
surface is capped; the prose is not).

## Out of scope (v1)

- **Deploy / config-change correlation**: SigNoz MCP exposes no deployments
  tool; do not fabricate one. Surface a user-mentioned deploy as context, but
  don't claim it caused the fire without signal evidence.
- **Cross-service blast-radius walking** (downstream callers): out of scope
  to keep context bounded.
- **Long-horizon historical baselines**: Tier 2 compares to one prior-day
  window, not weekly/monthly seasonality. If asked "is this normal for a
  Friday afternoon", suggest an anomaly alert (`signoz-creating-alerts` with
  `anomaly_rule`).

## Guardrails

- **Early-stop gates are mandatory**, not optional optimizations — skipping
  them explodes context.
- **Anchor every claim to a real MCP query result**; no speculation, no
  fabricated identifiers (trace IDs, span names, rule IDs, channel/deploy IDs
  must all come from real responses). If evidence is missing, lower
  confidence and say so.
- **Correlation ≠ causation**: only call something a cause with ≥2 converging
  signals (see Confidence in Step 5); otherwise it's a "co-occurring signal."
- **Report uncertainty honestly**: if nothing reaches medium confidence, the
  answer is "No clear root cause found" — false positives waste incident time
  more than false negatives.
- **Keep it a triage card, not a postmortem** — every section must add
  evidence the reader can't already see in the alert payload; drop generic
  advice.
- **Prefer resource-attribute filters** in every drill-down query (SigNoz MCP
  guideline; directly affects query speed at scale).
- **Read-only**: never call `signoz_update_alert`; surface tuning as a
  next-step recommendation.
- **State fire windows in UTC + relative** ("14:32 UTC, 2h ago") so
  autonomous and interactive consumers agree on the window.

## Example (full 3-tier run)

**User:** "Why did the checkout error rate alert fire?"

**Agent:**
1. Resolves alert: "High Error Rate - Checkout" (id 42).
2. `signoz_get_alert_history` → most recent fire 2h ago at 14:32 UTC,
   sustained 8m, single fire (not flapping).
3. **Tier 1**: re-runs error-rate formula over `[14:02, 15:02]`. Peak 12.4%
   (vs 5% threshold, 148% over), pre-fire baseline 0.3%. Real fire.
4. **Tier 2** (`service.name = checkout`): p99 4.1s vs 320ms (+1180%);
   throughput −42%; downstream `payments` error rate 18% vs 0.2% (+8900%);
   CPU/memory flat.
5. **Tier 3**: error traces top op `POST /checkout/submit`, message "context
   deadline exceeded calling payments-api", 30 traces same downstream URL;
   matching "payments client timeout" logs, 142 occurrences.
6. **Output**:

   > **TL;DR**: checkoutservice error rate hit 12.4% (threshold 5%) for 8m at
   > 14:32 UTC. Most likely cause: payments-api timing out (high confidence;
   > converging trace + log + neighbor evidence). Open trace `7af3a09b…`.

   - **What fired**: alert 42 fired 2h ago at 14:32 UTC, sustained 8m; error
     rate peaked 12.4% (148% over threshold).
   - **Investigation trail**:
     - ✅ Tier 1: peak 12.4% vs 5%, pre-fire baseline 0.3%. Real fire.
     - ✅ Tier 2: payments error rate +8900%, p99 +1180%, throughput −42%.
     - ❌ CPU / memory on checkout: flat.
     - ✅ Tier 3: 30 error traces all hit payments-api with `context deadline
       exceeded`; 142 matching timeout logs.
   - **Likely causes** (high): payments errors cascading into checkout.
     Evidence converges across topology (checkout → payments edge), temporal
     precedence (payments errors lead checkout p99), shared entity (every
     error trace targets the payments-api URL).
   - **Ruled out**: checkout-side resource pressure (CPU/memory flat);
     upstream traffic spike (throughput dropped, didn't spike).
   - **Next steps**: open trace `7af3a09b…`; if payments has its own alert,
     run `signoz-explaining-alerts` on it, else `signoz-generating-queries`
     for payments error rate over the last 4h.

Same structure applies to other patterns, differing only in where the tiers
stop. A **flapping / marginal** fire (e.g. CPU hovering 5% over an 80%
threshold, `matchType = at_least_once`) early-stops after Tier 1 → output is
a low-confidence "threshold tuning, not an incident" with a `matchType` →
`on_average` / `recoveryTarget` fix. A **log-volume** fire (no service
filter, `groupBy service.name`) resolves the firing series from history, then
runs all three tiers on that service (e.g. Tier 2 shows collapsed CPU/memory
+ pod restarts, Tier 3 shows "OOMKilled restarting" logs → high-confidence
OOM cause, check container memory limits).

## Additional resources

- `references/neighbor-signals.md`: resource type (service / host / k8s) →
  neighbor signals to pull in Tier 2.
- `references/baseline-comparison.md`: query templates pairing fire-window and
  baseline-window calls, including `signoz_execute_builder_query` format.
- `signoz-explaining-alerts`: decode the rule before investigating.
- `signoz-generating-queries`: ad-hoc follow-up queries on the same scope.
