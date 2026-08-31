---
name: autonomous-maintainer
description: "Run the agent as an autonomous maintainer of a product — set it up once, then loop on small, verified, logged improvements while keeping the product deployable at all times. Use when the user says 'maintain this product by itself', 'run it on autopilot', 'set up an autonomous maintainer', 'keep improving this overnight', 'self-maintaining product loop', or wants the agent to continuously ship and verify changes until stopped."
---

# Autonomous Maintainer

Turn the agent into an autonomous maintainer: set the product up once, then run a loop of
small, self-contained changes — each one **made, committed, verified, and kept or reverted**
— logging every experiment. Production stays deployable the whole time. "Better" is defined
by real user need, not cosmetic churn.

For a single scoped change with a finish line (a migration, one feature), this is the wrong
shape — that's a finite task, not a forever loop. Use it only when the goal is *ongoing*
improvement.

## Setup (once, with the user)

1. **Core product & intent** — what it does, who uses it, and what "better" means for them.
   This is the yardstick every later change is judged against.
2. **Codebase & platform** — where the code lives, where it runs (Vercel / Railway /
   self-hosted), and the exact build / run / test / deploy commands.
3. **Read the whole codebase** — take notes on what affects what; know the surface before you
   touch it.
4. **Baseline** — confirm it builds, runs, deploys cleanly *as-is*, and that you can
   reproduce current behavior, before changing anything.
5. **Init `changelog.md`** — one terse entry per experiment (date, change, why, `keep`/`revert`,
   how verified). Never log secrets or user data.
6. **Confirm and go** — get the user's OK on the above, then start the loop.

## Can / cannot

- **CAN** modify anything that ships to users: application code, components, styles, config,
  content.
- **CANNOT**, without the user's explicit OK:
  - Change the product's core purpose or remove functionality users depend on.
  - Take destructive or hard-to-reverse production actions — deleting or migrating user data,
    dropping tables, deleting accounts, rotating credentials.
  - Break the build or deploy. Every kept change leaves the product working and deployable.

## The loop (until interrupted)

Work on a dedicated branch; keep `main`/production deployable at every commit.

1. **Assess** — branch/commit, current behavior, known issues.
2. **Pick** the highest-value change available now — biggest user benefit, or biggest risk to
   retire.
3. **Make it.** Prefer small, verifiable changes; a bigger one is fine only when the payoff is
   real. Simpler is better — deleting code for equal/better behavior always wins.
4. **Commit** (use the `commit` skill for the message).
5. **Verify** (below). 
6. **Keep or revert.** Keep only a genuine, verified improvement; advance the branch (deploy
   if confident and the workflow calls for it, else leave it for the user to ship via `ship`).
   Otherwise — worse, neutral-but-more-complex, or broken — `git reset` back.
7. **Log** the outcome in `changelog.md`.

## Verifying a change

You are the evaluator. Before keeping anything:

- **Build** — it compiles, no errors.
- **Checks** — run the project's tests, lint, typecheck (e.g. `make all`, `bun lint`,
  `bun typecheck`). This is ground truth. (See the `verify` skill for driving the real flow.)
- **Run it** — exercise the change end-to-end; confirm it does what you intended and breaks
  nothing adjacent.
- **Analytics** (if wired) — after it settles, confirm the relevant events/funnels/errors move
  the intended way with no regression.

A change is good only if the product still works end-to-end and does what you intended. If you
can't verify it, treat it as not working.

## Analytics (optional)

If the product has PostHog or similar, use it both to choose work and to confirm impact — pair
with the `posthog` skill. Instrument missing signal yourself (tracking a missing user action is
a valid experiment). Let funnels, drop-offs, errors, and retention pick the highest-value work.
Gate risky changes behind feature flags. Never put PII or secrets in event properties.

## Never stop

Once the loop begins, don't ask the human whether to continue — they may be away and expect
work until manually stopped. Out of ideas? Re-read the codebase for rough edges, mine analytics
for real user pain, polish UX, pay down tech debt, improve tests and docs, try bolder features.
To actually run unattended, drive the loop with the `loop` skill (a recurring interval) and let
it run until interrupted. Left running, it stacks up many verified, logged improvements — the
user returns to a maintained, better product.

## Guardrails

- Keep `main`/production deployable at all times; do experiments on a branch.
- Never fake green — don't weaken, skip, or delete tests to pass.
- Rewind sparingly: quick breakage (typo, bad import) → fix and re-verify; fundamentally
  broken or fighting you after a few tries → revert, log it, move on.
- Never log secrets or user data in `changelog.md` or analytics.
