---
name: flesch-kincaid-proofreader
description: Measure and improve the readability of English copy with the Flesch–Kincaid grade-level test. Use when proofreading or simplifying READMEs, documentation, product copy, help text, announcements, or other prose, especially when a target reading grade is requested.
compatibility: Requires Node.js 18 or newer. Syllable estimates are designed for English prose.
---

# Flesch–Kincaid Proofreader

Use the bundled script for measurement and sentence triage. Use the language model only for the semantic work that a deterministic tool cannot do: preserving meaning, voice, and technical accuracy while rewriting.

## Workflow

1. Choose the target grade. Use the user's target when given; otherwise use grade 8.
2. Run the deterministic analyzer before editing:

   ```bash
   node scripts/readability.mjs --target 8 path/to/README.md
   ```

3. Review the script's difficult sentences in descending grade order. Start with sentences that are both long and far above the target. The listed complex words are candidates, not automatic errors.
4. Rewrite only where useful. Prefer:
   - one main idea per sentence;
   - familiar, precise words over longer synonyms;
   - active, concrete constructions;
   - bullets for genuine lists;
   - keeping required technical terms and explaining them once.
5. Run the same command again. Continue until the copy meets the target or further simplification would harm accuracy, voice, or usefulness.
6. Report the before/after grade and any intentional exceptions. Never claim that a passing score proves the copy is clear or correct.

Do not estimate the grade yourself, count words or syllables manually, or ask the model to rank every sentence. The script owns those deterministic steps.

## Commands

Analyze one or more files:

```bash
node scripts/readability.mjs --target 8 README.md docs/getting-started.md
```

Analyze selected text through stdin:

```bash
printf '%s\n' 'Paste the copy here.' | node scripts/readability.mjs --target 8
```

Produce structured output for another tool:

```bash
node scripts/readability.mjs --json --target 8 README.md
```

Use as a check that exits with status 1 when any document is above target (or has no prose):

```bash
node scripts/readability.mjs --target 8 --fail-above README.md
```

Run `node scripts/readability.mjs --help` for all options. Markdown code blocks, link destinations, HTML tags, comments, headings, tables, and frontmatter are excluded by default. Inline code remains because it is often part of a technical sentence. Pass `--include-code` only when fenced code blocks should count as prose.

## Interpretation

The script implements:

```text
0.39 × (words / sentences) + 11.8 × (syllables / words) − 15.59
```

A result of `8.0` roughly indicates text suited to a US eighth-grade reader. Negative values are valid for very simple text. The test measures sentence length and estimated word length; it does **not** measure correctness, structure, jargon familiarity, accessibility, tone, or reader knowledge.

Syllable counting is a deterministic English heuristic, so names, acronyms, code identifiers, and specialist terms may be miscounted. Treat small score differences as noise. Keep accurate terms rather than gaming the score, and use judgment for text that is not English.

## Validation

After changing the analyzer, run:

```bash
node --test tests/*.test.mjs
```
