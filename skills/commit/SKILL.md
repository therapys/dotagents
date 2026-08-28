---
name: commit
description: "Read this skill before making git commits"
---

Create a git commit for the current changes using a concise Conventional Commits-style subject.

## Format

`<type>(<scope>): <summary>`

- `type` REQUIRED. Use `feat` for new features, `fix` for bug fixes. Other common types: `docs`, `refactor`, `chore`, `test`, `perf`.
- `scope` OPTIONAL. Short noun in parentheses for the affected area (e.g., `api`, `parser`, `ui`).
- `summary` REQUIRED. Short, imperative, <= 72 chars, no trailing period.

## Notes

- Body is OPTIONAL. If needed, add a blank line after the subject and write short paragraphs.
- Do NOT include breaking-change markers or footers.
- Do NOT add sign-offs (no `Signed-off-by`).
- Only commit; do NOT push.
- Treat caller-provided arguments as additional guidance: freeform instructions shape scope/summary/body; file paths or globs limit which files to commit (stage/commit only those unless the user explicitly asks otherwise); if arguments combine both, honor both.

## Steps

1. Infer from the prompt if the user provided specific file paths/globs and/or additional instructions.
2. Review `git status` and `git diff` to understand the current changes (limit to argument-specified files if provided).
3. (Optional) Run `git log -n 50 --pretty=format:%s` to see commonly used scopes.
4. If there are ambiguous extra files, ask the user for clarification before committing.
5. Stage only the intended files (all changes if no files specified).
6. Run `git commit -m "<subject>"` (and `-m "<body>"` if needed).
