---
name: update-agents-md
description: "Generate or refresh a repo's AGENTS.md (the source-of-truth agent context file) and its one-line CLAUDE.md pointer. Use when the user says 'update the claude.md', 'update AGENTS.md', 'analyze this project and update the context file', 'write an AGENTS.md', or after a stack/structure change makes the current file stale."
---

# Update AGENTS.md

This skill follows a two-file convention: **`AGENTS.md` is the single source of truth**, and **`CLAUDE.md` is a one-line pointer** containing exactly `@AGENTS.md`. pi reads `AGENTS.md` directly; Claude Code reads `CLAUDE.md`, which imports it. Maintain AGENTS.md — never duplicate content across the two files.

## Trigger

"update the claude.md / agents.md", "analyze this project and update the context file", "write an AGENTS.md", or a stack/layout change that leaves the current file stale.

## Steps

1. **Ground yourself in the repo — don't invent:**
   - *Stack:* read `package.json` (dependencies + `scripts`), the lockfile (bun/pnpm/npm — tells you the package manager), framework config, `tsconfig`, and linter/formatter config.
   - *Layout:* list the real top-level and `src/` dirs; open a few to learn what each actually holds.
   - *Conventions:* infer from existing code — import alias, state/data libraries, auth, testing, formatting — and cite real paths.
2. **Write/refresh `AGENTS.md`** using the skeleton below. Keep it dense and specific: every line should save an agent a lookup. No filler, no restating generic framework docs.
3. **Ensure `CLAUDE.md` is exactly `@AGENTS.md`** (create or replace). If CLAUDE.md already holds real content and there's no AGENTS.md, migrate that content into AGENTS.md first, then reduce CLAUDE.md to the one-line pointer.
4. **Preserve tool-managed blocks verbatim** — e.g. `<!-- BEGIN:nextjs-agent-rules -->…<!-- END:nextjs-agent-rules -->` is rewritten by `next dev`. Keep it in place and commit it with your changes (removing it only re-creates an uncommitted diff).

## Section skeleton (AGENTS.md)

```
## Stack
- framework + versions, package manager, db/orm, auth, styling, state, lint/format — one bullet each, real versions

## Repo Layout
- `dir/` — what lives here and the one rule an agent must know (cite real paths)

## Runtime Patterns
- how requests / data / sessions actually flow; the non-obvious wiring

## Conventions
- import alias, where to add X before creating new, naming, do / don't

## Agent Behavior
- repo-specific rules: what to run before committing, what never to touch, gotchas
```

## Guardrails

- Match the terseness of the repo's existing AGENTS.md files (~40–110 lines). If it's growing long, cut — link to code instead of explaining it.
- Never document a path or pattern you haven't verified in the tree (e.g. don't reference an old `sessions.ts` if the code now lives in `src/lib/sessions/`).
- No license boilerplate, no table of contents, no "this file provides guidance" preamble.
- Leave committing/PRs to the `commit` / `ship` skills.
