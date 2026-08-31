# Security Policy

This repo installs itself into your agent tools by **symlinking** directories into
`~/.claude` and `~/.pi`, and it ships hooks that run on your machine. It also holds skills
that touch email, calendars, files, and analytics. Please treat it accordingly.

## What this repo does and does not touch

- The installer only creates symlinks and runs `npm install` inside extension folders. It
  backs up any real directory it would replace to `*.pre-dotagents` and restores it on
  `uninstall`. See [`bin/dotagents.mjs`](bin/dotagents.mjs).
- Secrets and per-machine state are **never** meant to live here. `auth.json`,
  `*auth*.json`, `models-store.json`, and `sessions/` are gitignored, and CI runs a
  provider-agnostic secret scan on every push and PR.
- Private, project-specific skills are kept local and excluded via `.gitignore`.

## Reporting a vulnerability

Please **do not** open a public issue for a security problem — including a secret you
believe was committed by mistake.

Report it privately through GitHub's
[private vulnerability reporting](https://github.com/therapys/dotagents/security/advisories/new)
for this repository. Include:

- what you found and where (file, commit, or behavior),
- how to reproduce it, and
- the impact you expect.

You'll get an acknowledgement, and a fix or mitigation will be coordinated before any
public disclosure.

## If you find a leaked secret

Rotate the credential first — assume anything committed to git history is compromised.
Then report it as above so the history can be cleaned. Never paste the live secret into an
issue or PR.
