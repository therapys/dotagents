---
name: compress-skills
description: "Compress one or more SKILL.md files so they consume less context on load while preserving 100% of their value — same triggers, capabilities, guardrails, thresholds, and output. Use when the user says 'compress this skill', 'optimize skills for context', 'make skills use less context', 'slim down the skills', 'reduce skill token usage', 'shrink SKILL.md', or wants a skill or whole skill suite trimmed without losing behavior."
---

# Compress Skills

Shrink the tokens a skill costs when loaded, with zero loss of value: every trigger, step, guardrail, tool name, threshold, and output spec survives. This is **compression, not redesign** — never add features or change behavior.

## How skills spend context (optimize the right layer)

- **Frontmatter `description`** — loads into *every* session; drives auto-invocation. Keep all trigger phrases/keywords/scenarios. You may tighten wording, never drop a trigger. Editing it is high-risk; touch it last and least.
- **SKILL.md body** — loads on every invocation. **Primary target.**
- **Reference files** (`references/*.md`, `REFERENCE.md`, recipes) — load only when opened. Move occasionally-needed detail here to shrink the mandatory body.

## Process

1. **Scope.** List the target skills. `wc -c` each file for a baseline. Skip files gitignored as private unless the user names them. Skip already-minimal files (< ~1 KB with no redundancy) — report "already minimal" rather than risk value.
2. **Optimize.** One skill → do it inline with the rulebook below. Many → fan out one subagent per skill (or small group), run in parallel.
3. **Verify** every result (checklist below) — centrally, don't trust a subagent's self-report.
4. **Report** before/after bytes and % per file and total, what was cut, and any risk.

### Optimization rulebook (also the subagent brief)

1. Cut redundancy, repetition, restatement, filler. Same instruction/guardrail twice → keep once.
2. Collapse near-duplicate examples to the single most instructive one. Long worked examples are the biggest waste — trim hard, keep one.
3. Prose → tight imperative bullets/steps. Drop hedging and obvious explanation.
4. PRESERVE EVERY actionable step, guardrail, tool/function name, exact command/flag/syntax, code/CSS/design-token value, ordering constraint, output-format spec, edge case, and threshold/number. When in doubt, keep it.
5. Move genuinely-optional detail from the body into a reference file the skill points to — never fragment tightly-coupled instructions.
6. Keep all frontmatter keys valid (`---` delimited) and every trigger phrase in `description`. Keep markdown well-formed. Match the author's voice.
7. No new features, no behavior change, no restyling beyond compression.

### Fan-out for a suite

Give each subagent: the rulebook above, the "how skills spend context" note, its assigned absolute file paths, and the report format. Run them in parallel. Then aggregate and verify centrally.

## Verify (every skill, deterministically)

- Frontmatter still opens/closes with `---` and has `name` + `description`.
- `git diff` the `description:` lines — expect byte-identical except intentional, trigger-preserving rewordings.
- `grep` the load-bearing tokens (tool names, enums, thresholds, output-section headers, commands) — all still present.
- Re-`wc -c`; confirm a real drop.
- Read through any file cut > ~30% to confirm no capability was dropped.

## Guardrails

- **Triggers are sacred.** A dropped trigger phrase silently breaks discovery. Diff descriptions to prove they're intact.
- **Don't touch protected literals** — code, HogQL/SQL, CSS/color/radius/shader values, exact commands/flags/paths stay byte-for-byte.
- **Leave already-tight files alone.** Trimming a 500 B skill risks value for no real saving.
- **Respect `.gitignore`.** Private, local-only skills stay untouched unless the user names them.
- **Report honestly.** Give per-file numbers, flag anything uncertain, and don't inflate the reduction.

## Report format

Per file: `<path>: <before>B → <after>B (−XX%)`, a TOTAL line, 3–6 bullets on what was cut/moved and why value survives, and a RISK line. A shareable summary (e.g. display.dev) is optional — only when asked.
