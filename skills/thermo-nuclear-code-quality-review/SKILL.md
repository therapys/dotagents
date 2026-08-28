---
name: thermo-nuclear-code-quality-review
description: Run an extremely strict maintainability review for abstraction quality, giant files, and spaghetti-condition growth. Use for a thermo-nuclear code quality review, thermonuclear review, deep code quality audit, or especially harsh maintainability review.
disable-model-invocation: true
---

# Thermo-Nuclear Code Quality Review

An unusually strict review of implementation quality, maintainability, abstraction quality, and codebase health. Above all, be **ambitious** about structure: don't just find local cleanup — hunt for "code judo" moves that preserve behavior while making the code dramatically simpler, smaller, more direct, and more elegant.

## Core Prompt

Start from this baseline:

> Perform a deep code quality audit of the current branch's changes.
> Rethink how to structure / implement the changes to meaningfully improve code quality without impacting behavior.
> Work to improve abstractions, modularity, reduce Spaghetti code, improve succinctness and legibility.
> Be ambitious, if there is a clear path to improving the implementation that involves restructuring some of the codebase, go for it.
> Be extremely thorough and rigorous. Measure twice, cut once.

## Standards (non-negotiable)

0. **Be ambitious about structural simplification.** Don't stop at "this could be a bit cleaner." Look to reframe the change so whole branches, helpers, modes, conditionals, or layers disappear entirely. Assume a "code judo" move often exists — a re-org that uses the existing architecture more effectively to make the change dramatically simpler. Prefer deleting complexity over rearranging it; prefer the solution that feels inevitable in hindsight.

1. **A PR pushing a file from under 1k lines to over 1k lines is a strong smell** — treat it as a code-quality smell by default. Prefer extracting helpers/subcomponents/modules/local abstractions instead of letting a file sprawl past 1000 lines. If the diff crosses that threshold, explicitly ask whether to decompose first. Waive only for a compelling structural reason with the result still clearly organized.

2. **No random spaghetti growth in existing code.** Be highly suspicious of new ad-hoc conditionals, scattered special cases, one-off branches inserted into unrelated flows. Treat "weird if statements in random places" as a design problem, not a stylistic nit. Push the logic into a dedicated abstraction/helper/state machine/policy object/module instead of tangling an existing path. Call out changes that make surrounding code harder to reason about even if they technically work.

3. **Clean the design, don't just accept working code.** If behavior can stay the same while structure gets meaningfully cleaner, push for the cleaner version. Don't rubber-stamp "it works." Strongly prefer removing moving pieces over refactors that spread the same complexity around.

4. **Prefer direct, boring, maintainable code over hacky or magical code.** Treat brittle, ad-hoc, or "magic" behavior as a code-quality problem. Be skeptical of generic mechanisms that hide simple data-shape assumptions. Flag thin abstractions, identity wrappers, or pass-through helpers that add indirection without buying clarity.

5. **Push hard on type and boundary cleanliness when it affects maintainability.** Question unnecessary optionality, `unknown`, `any`, or cast-heavy code when a clearer type boundary could exist. Prefer explicit typed models or shared contracts over loosely-shaped ad-hoc objects. If a branch relies on silent fallback to paper over an unclear invariant, ask whether the boundary should be made explicit.

6. **Keep logic in the canonical layer and reuse existing helpers.** Call out feature logic leaking into shared paths, or implementation details leaking through APIs. Prefer existing canonical utilities over bespoke one-offs (including copy-pasted logic). Push code toward the right package/service/module instead of normalizing architectural drift.

7. **Treat needless sequential orchestration and non-atomic updates as design smells when the cleaner structure is obvious.** If independent work is serialized for no good reason, ask whether it should run in parallel. If related updates can leave state half-applied, push for a more atomic structure. Don't over-index on micro-optimizations, but do flag avoidable orchestration brittleness.

## Preferred remedies

Prefer suggestions that delete complexity, not polish it: delete a layer of indirection; reframe the state model so conditionals disappear; change the ownership boundary so the feature becomes a natural extension of an existing abstraction; turn special-case logic into a simpler default flow; extract a helper/pure function; split a large file into focused modules; replace condition chains with a typed model or explicit dispatcher; separate orchestration from business logic; collapse duplicate branches; reuse the canonical helper instead of a near-duplicate; make type boundaries explicit so control flow simplifies; move logic to the package/module/layer that already owns the concept; parallelize or make updates atomic when that also simplifies the flow.

## Tone & phrases

Be direct, serious, and demanding — not rude, but don't soften major maintainability issues into mild suggestions. If the code makes the codebase messier, say so. If it missed an opportunity for dramatic simplification, say that too. Don't settle for "maybe rename this" when the real issue is structural, nor for a merely cleaner version of the same messy idea when a much simpler idea is plausible.

Good phrases:

- `this pushes the file past 1k lines. can we decompose this first?`
- `this adds another special-case branch into an already busy flow. can we move this behind its own abstraction?`
- `this works, but it makes the surrounding code more spaghetti. let's keep the behavior and restructure the implementation.`
- `this feels like feature logic leaking into a shared path. can we isolate it?`
- `this abstraction seems unnecessary. can we just keep the direct flow?`
- `why does this need a cast / optional here? can we make the boundary more explicit instead?`
- `this looks like a bespoke helper for something we already have elsewhere. can we reuse the canonical one?`
- `i think there's a code-judo move here that makes this much simpler. can we reframe this so these branches disappear?`
- `this refactor moves complexity around, but doesn't really delete it. is there a way to make the model itself simpler?`

## Output

Prioritize findings: (1) structural code-quality regressions; (2) missed dramatic-simplification / code-judo restructuring; (3) spaghetti / branching-complexity increases; (4) boundary / abstraction / type-contract problems; (5) file-size and decomposition; (6) modularity and abstraction; (7) legibility and maintainability. Don't flood with low-value nits when larger structural issues exist — prefer a few high-conviction comments over a long list of cosmetic notes.

## Approval bar

Don't approve merely because behavior seems correct. The bar: no clear structural regression; no obvious missed dramatic simplification when such a path is visible; no unjustified file-size explosion; no obvious spaghetti-growth from special-case branching; no hacky/magical abstraction that makes code harder to reason about; no unnecessary wrapper/cast/optionality churn obscuring the design; no architecture-boundary leak or avoidable canonical-helper duplication; no missed obvious decomposition that would materially improve maintainability.

Presumptive blockers unless the author justifies them clearly: preserves lots of incidental complexity when a plausible code-judo move would delete it; pushes a file from below 1000 to above 1000 lines; adds ad-hoc branching that tangles an existing flow; solves a local problem by scattering feature checks across shared code; adds an unnecessary abstraction/wrapper/cast-heavy contract; duplicates an existing helper or puts logic in the wrong layer. Otherwise, leave explicit, actionable feedback and push for a cleaner decomposition.
