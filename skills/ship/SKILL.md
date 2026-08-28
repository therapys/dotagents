---
name: ship
description: "Take the current changes from a dirty tree to an open pull request — branch, commit, push, and open the PR. Use when the user says any of: 'create a pr to main/dev', 'open a pr', 'push to main', 'commit and push', 'push this to git', 'ship it', 'push to the linear branch and open a draft PR', or asks to do the same across multiple repos ('push to each repo except infra')."
---

# Ship

One flow from working changes to an open PR. Delegates the commit *message* to the `commit` skill; owns everything around it (branch, push, PR).

## Conventions

- **Base branch is `main`.** Only target `dev` when the user explicitly says "to dev".
- **Branch naming:**
  - Linear issue given (e.g. `ABC-123`): name the branch `<id>/<slug>` (lowercase id + short kebab slug from the issue title), matching Linear's copy-branch format. Use the Linear MCP to fetch the issue title for the slug when available.
  - Otherwise: `feat/<slug>` for features, `fix/<slug>` for bug fixes (mirrors existing branches).
- **PR is a normal PR by default.** Open a **draft** only when the user says "draft".
- Never target or push directly onto `main`/`dev` for feature work — always go through a branch + PR, even when the user says "push to main" (that means "get it onto main *via a PR*").

## Steps

1. `git status` / `git diff` to understand the changes and the current branch.
2. **Branch:** if currently on `main`/`dev`, create the correctly-named branch (see conventions) and switch to it. If already on a suitable feature branch, stay.
3. **Commit:** follow the `commit` skill for the message (Conventional Commits subject). Honor any file scoping or guidance in the user's prompt.
4. **Push:** `git push -u origin <branch>`.
5. **Open PR:** `gh pr create --base <main|dev> --title "<subject>" --body "<short summary>"` (add `--draft` only if requested). Prefer `--fill` when the commit subject/body already say enough.
6. Return the PR URL. If CI matters, hand off to `fix-ci`.

## Multi-repo mode

Trigger: "on each of the repos", "all repos except infra", "push to git on each repo".

- Target set = the sibling git repos under a shared parent dir.
- Honor any excludes the user names (e.g. "except infra").
- Run steps 1–5 per repo that has changes. Skip clean repos and report them as skipped.
- Summarize at the end: one line per repo → branch + PR URL (or "no changes").

## Guardrails

- If there are unrelated/ambiguous staged files, ask which to include before committing (per the `commit` skill).
- Don't force-push. Don't amend or rebase shared history unless asked.
- If a Linear issue id was given, after opening the PR, offer to move the issue to "In Review" / link the PR via the Linear MCP — do it only if the user confirms.
