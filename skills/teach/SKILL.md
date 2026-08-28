---
name: teach
description: Teach the user anything so it actually locks in and is understood, not just memorized. Use ANY time you're explaining or teaching him something — even a quick explanation. Based on two teaching principles he has personally verified to work for years.
---

# Teaching

Two principles — not tips, but how you teach him every time, for any explanation from a one-liner to a deep dive. No other method comes close.

The goal is never "he can recite the fact" but **understanding**: the fact is derivable from foundations he already accepts, connected into his mental model, and therefore self-preserving. Memorized facts rot; understood facts don't.

## The philosophy (internalize it)

Two brains can hold the same propositions and look identical from outside. But one holds **disconnected lone facts** (A); the other holds a few **core truths** from which those facts derive, so to it they're obviously connected (B). That connection *is* understanding — it preserves knowledge (held in place by its connections), compresses it, and is just plain better. Every move below builds that dependency graph in his head: **nodes** (Principle i) and **edges** (Principle ii).

The felt goal is **the click**: the moment a pile of lonely facts collapses into a few generating ideas — same information, far fewer moving parts. Aim for it.

Key mechanism: **the brain won't fully commit to a fact it isn't sure is safe to lock in.** If something more fundamental might later contradict it, committing risks an expensive update — so the brain hedges and the fact never lands. Both principles remove that risk.

## Principle i — Unconditional truths first

Start from the ground. Lock in core, **always-true** unconditional truths before anything built on them.

Why start here? Not because bottom-up is logically "correct" — because unconditional truths are the *easiest* thing for the brain to accept: they're safe, commit instantly, and give the first solid ground to build from. Especially valuable when the subject is new with little to connect to yet.

**Terminology — keep distinct, don't overuse "axiom."** An *unconditional truth* is a fact he accepts **as-is, at face value, no caveats** (a property of *how it's held*). An *axiom* **follows from nothing else** (a property of *where it sits* — a root with no incoming edges). They overlap but aren't synonyms: a caveat-free axiom is one kind of unconditional truth, but many unconditional truths *do* derive from deeper things — they just don't need that derivation to be safely accepted. Default to **"unconditional truth"**; reserve **"axiom"** for facts that genuinely bottom out. Don't call something an axiom just because it sounds foundational.

- Find the few hard facts he can take at face value — often first principles depending on nothing else, though they needn't be true roots. There may be very few; small and solid beats large and shaky.
- They must be simple enough to accept **as-is, without nuance or caveats**. No "well, usually…". If it needs conditions, it's not one yet — dig down further.
- These commit *instantly and safely* because nothing more fundamental will contradict them. That safety is what makes them lock in.
- Build everything else up from these, explicitly, so he sees each new fact resting on the foundation.

**Confirm the foundation before building on it.** Briefly check each core truth reads as obviously/unconditionally true to him first. If one doesn't feel rock-solid, stop and fix it — don't build on sand.

**Two strong forms to reach for:**
- **Universal statements** — *"all X are Y"* / *"no X is Y"*. Easy to lock in because they admit no exceptions to hedge against. The clean atomic-unit version (*"ALL X is done through {____}"*, e.g. *"ALL communication between computers is done through {sending packets}"*) is one particularly strong special case — surface it when a domain has one, but it's just one shape, not the only one.
- **Real definitions** — a genuine definition anchors well, but only if it's an *actual* definition, not a vague list of properties dressed up as one ("things that tend to be true of X" isn't a definition and won't anchor anything).

Don't force either where there isn't a clean one.

## Principle ii — "How could I have discovered this?"

Facts feel arbitrary when there's no visible reason they *had* to be this way ("Why like this? Feels arbitrary."). The brain won't commit to arbitrary-feeling info. The fix: make it feel discovered, not decreed.

Walk him through how he **could have discovered it himself**. Every step must be *motivated*:

- Start from square one: **why are we even doing this?** What core problem sends us down this path?
- Motivate every intermediate step: why try *this* formula? why manipulate the equation *this* way? What could have led someone here?
- Output: turning **disconnected propositions → connected propositions** — adding the edges to the graph.

3Blue1Brown (Grant Sanderson) is the master reference: nothing appears from nowhere; every move feels like something the learner might have reached for themselves.

### Socratic vs expository — adaptive

Choose per topic and his apparent energy:
- **Socratic** — pose the motivating problem and let him attempt the discovery before you reveal. More effortful, stronger locking-in. Default when he can plausibly reason his way there. "Let him attempt it" is about *who speaks first*, not grading: if the question has a definite right answer (even an open-ended prompt you then frame as multiple-choice), it's gradable — use `quiz`, not `ask_user_question`. Reserve `ask_user_question` for genuine no-right-answer forks (preferences, direction, what he wants next).
- **Expository** — you narrate the motivated discovery path yourself (3B1B style), no back-and-forth. Use when the topic is beyond cold-reasoning reach, or he's low-energy / wants it delivered.

When unsure, lean Socratic for things he can clearly reason about; otherwise narrate.

## The process: probe → plan → teach

The principles are *how* you teach; this is *when* — the shape of a session. Run all three phases in order every time; scale each phase's *size* to the topic, never its *shape*.

**Accuracy is non-negotiable — verify, don't wing it from memory.** He has to trust the teacher completely; one confidently-delivered hallucination poisons that. **The moment you're even slightly unsure of any fact, name, date, formula, definition, or claim, stop and confirm it with a quick `researcher` subagent before you say it.** Pausing to verify always beats flow. If a check corrects what you were about to teach, say so plainly rather than papering over it. A wrong unconditional truth or "discovered" step corrupts every node built on top of it.

### Writing quiz options — a construction procedure (every `quiz`)

The tool tells you to keep options even, but that's a *post-hoc audit* — you write a good answer plus throwaway wrongs, then don't re-scrutinise them; the tell is baked in before any check runs. So don't audit afterwards; **build options so evenness is automatic**:

1. **Every option is a bare claim — no justification anywhere.** The #1 giveaway is the correct option carrying its own reasoning ("…, because it preserves X") while distractors are bare, making it longer and more specific. Put *zero* "why" in any option; all reasoning goes in `explanation`, which only appears after he answers.
2. **Write the correct claim first, then mutate it into each distractor.** Take one specific misconception or easily-confused neighbour and state what someone holding it would claim — in the *same* skeleton, grain size, and register as the correct claim. Now every option is "the claim under some belief," and the correct one is just the claim under the *correct* belief. Parallelism falls out by construction.
3. Each distractor must be a real error he might actually make (so his pick is diagnostic), yet unambiguously wrong on the intended reading — tempting, not tricky.
4. **No asymmetric bolding.** Don't bold the key concept in only the correct option — that flags it instantly. Bold nothing, or bold the parallel term in every option.

If, reading the finished set cold, you can still tell which is right without knowing the material, you skipped step 1 or 2 — regenerate, don't patch.

### Phase 1 — Probe (never skip)

You can't teach into his zone of proximal development without knowing its edges, and can't aim without knowing what he's reaching for. Two unknowns, two tools — keep the boundary clean:

**1a. His current level — use `quiz`. A mapping job, not a spot-check.** Locate the *edge* of his understanding — the frontier where what he reliably knows turns into what he doesn't — along every strand the lesson depends on. Until you've found that edge you can't teach into it, so this phase takes as long and detailed as it needs. No rush.

**The edge is only located when bracketed.** For each strand you need *both*: something at that level he gets **right** (a floor — proof he knows at least this much) and something he gets **wrong** or doesn't know (a ceiling — where it runs out). The edge sits between them; one side alone tells you almost nothing.

- **All-correct is not "done" — the questions were too easy.** A floor with no ceiling proves he knows *at least* this much and nothing about where it ends. Don't advance. Escalate — go harder until something breaks. If he never misses, you never found the edge.
- **Binary-search the edge.** Nails a question → jump difficulty *sharply*, don't inch. Misses → you've bracketed from above; narrow back in to pin where it sits.
- **One wrong answer is not "done" either — and not a cue to start teaching.** A single miss is one coordinate of unknown kind: careless slip, narrow isolated gap, or systematic misconception. Probe *around* it to characterize it before concluding. Misconceptions matter most — a confidently-held wrong model must be dislodged, not topped up — so when you catch one, dig into its extent.
- **Map every strand the lesson rests on.** The edge is a frontier across all prerequisite threads, not a point. Probe each thread the explanation leans on; bound by *relevance to the goal* — map every corner the teaching depends on, skip the ones it won't.

Don't advance to Phase 2 until, for each goal-relevant strand, you can state both what he has and where it ends. This is how nuance is handled: many small graded questions, each adapted to the last answer — not one big caveated one. Every `quiz` carries the correct answer, so you learn *exactly where* he goes wrong.

**1b. His learning goal — use `ask_user_question`.** Find what he actually wants taught. With an unfamiliar subject the goal is often hard to articulate — "I want to understand LLMs" or "how the internet works" can mean ten different things, and which one changes everything you teach. Interrogate the vision until concrete. No right answer, so `ask_user_question`, never `quiz`.

### Phase 2 — Plan (think hard)

The highest-leverage step; don't rush. With his level and goal in hand, reason out the best way to teach *this thing* to *this person*, against the philosophy above:

- **Scope the field first with a `researcher` subagent.** Before planning the graph, map the topic — core concepts, real first principles, standard framings, common gotchas. Refreshes your grip and surfaces the genuine unconditional truths so you don't plan around a half-remembered version. Cheap, and makes the plan more accurate.
- What unconditional truths does this rest on? Is there a clean atomic unit ("ALL X is done through {____}")?
- Which does he already hold (Phase 1a)? Build from there — not below, not above.
- What's the motivated discovery path from those truths to his goal? Where does each step come from — why would anyone reach for it?
- Socratic or expository for each stretch, given topic and energy?

A good plan makes the teaching feel inevitable instead of arbitrary.

**Then present the plan in chat — always, before any teaching.** Two parts:

1. **The approach, in prose.** What we'll cover, in what order, and why this way — given his edge (1a) and goal (1b). A few freeform sentences.
2. **The dependency map.** The backbone as a DAG: unconditional truths at the roots, each derived node hanging off its dependencies, his goal as the sink. Draw a small ```mermaid``` graph (Obsidian renders it natively in the log). This map *is* the teaching order — Phase 3 builds it node by node. Keep it small: few nodes, short labels — a map, not the territory.

**Stress-test the roots before presenting.** For every node you treat as foundational, ask: genuinely an unconditional truth *for him*, or a disguised theorem deriving from something simpler he'd accept at face value? If it derives, push it down and extend the map — never found the lesson on a mid-level fact. A wrong root corrupts everything hung off it, and roots are far easier to audit in a drawn map than mid-flow.

**Then stop and wait for his go-ahead.** The plan is his checkpoint: a wrong root or scope is cheap to fix now, expensive mid-lesson. Don't begin Phase 3 until he okays it.

### Phase 3 — Teach (the loop)

Build his dependency graph one **node** at a time — every node gets the same treatment, foundational unconditional truth or derived step alike. Most topics need several; each goes through the loop.

For **every node** (each unconditional truth *and* each non-trivial reasoning step toward the goal), run:

1. **Motivate.** Frame why we need this node now — what problem it solves or gap it closes. Applies to unconditional truths too: don't just assert one because it's true, motivate why *this* truth, *now*.
2. **Establish.**
   - Foundational unconditional truth: state it plainly, face value, no caveats. Surface an atomic unit if one fits.
   - Derived step: build it up from what's established via a motivated move (Socratic or expository), answering "how could I have discovered this?" When a Socratic step has a gradable right/wrong answer, pose it with `quiz` even while he's "attempting the discovery" — gradable-and-Socratic is normal; fall back to `ask_user_question` only if there's genuinely no right answer.
3. **Connect.** Make the dependency edge explicit — show how this node hangs off the ones already in place, so it's understood, not memorized.
4. **Quiz-check.** Confirm the node landed with a quick `quiz` — foundations as much as derived steps. An unconfirmed unconditional truth is as dangerous as an unconfirmed derived fact: if he misses it, that node isn't solid — fix it before building on top.

Repeat the full loop per node — don't front-load all foundations at the start then stop checking. Any new unconditional truth needed mid-session goes through motivate → establish → connect → quiz-check too.

If you catch yourself asserting a fact he'd take on faith — foundational or not — stop: motivate it and confirm it lands, or ground it in something already established. Unmotivated, unconfirmed facts don't lock in — that's the whole point.

## Formatting — math renders as LaTeX

Everything in a session renders through Obsidian, which renders LaTeX natively. Whenever math notation is involved — explanations, questions, quiz options and explanations, anything — write LaTeX, not plain-text approximations:

- Inline: `$f(x)$`
- Display: `$$` fenced on its own lines, e.g. `$$\n f(x) \n$$`

If LaTeX can be used, use it. Write $f(x) = x^2$, not `f(x) = x^2`.
