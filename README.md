# dotagents

My collection of skills for [Claude Code](https://github.com/anthropics/claude-code) and
[pi](https://github.com/earendil-works/pi), tuned to load light and trigger reliably. Both
tools read the same `SKILL.md` format, so skills live in one place and symlinks share them
with both. A single edit takes effect in both tools at once.

[![CI](https://github.com/therapys/dotagents/actions/workflows/ci.yml/badge.svg)](https://github.com/therapys/dotagents/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Install

```bash
npx github:therapys/dotagents install     # clone + symlink into ~/.claude and ~/.pi
npx github:therapys/dotagents update      # git pull the latest
npx github:therapys/dotagents uninstall   # remove symlinks (restore backups); --purge also deletes the clone
npx github:therapys/dotagents status      # show repo + symlink state
```

`install` clones the repo to `~/.config/dotagents`, backs up any existing `skills`,
`extensions`, and `agents` dirs to `*.pre-dotagents`, symlinks the live tool paths to this
repo, and runs `npm install` for each extension that has a `package.json`. It's safe to run
more than once. `uninstall` removes the links and restores the backups.

Override the path with `[dir]`, `--dir <path>`, or `DOTAGENTS_DIR` (default
`$XDG_CONFIG_HOME/dotagents`). Use `--skip-npm` to skip npm installs, and `DOTAGENTS_REPO`
to install from a fork.

> **Note:** `visual-tools` installs Puppeteer and mermaid-cli (~460 MB in the gitignored
> `node_modules`). Puppeteer fetches Chromium via a `postinstall` script; if npm blocks it,
> run `npm install-scripts approve puppeteer` in that dir or set `PUPPETEER_EXECUTABLE_PATH`.

## Skills

Each skill is a folder under `skills/` with a `SKILL.md`. Both tools load it by its
frontmatter description.

- `commit` — write a Conventional Commit for staged changes
- `ship` — dirty tree → branch, commit, push, open PR
- `fix-ci` — find failing PR checks, read logs, apply fixes
- `get-pr-comments` — fetch and summarize review comments on the active PR
- `thermo-nuclear-code-quality-review` — strict maintainability audit
- `frontend` — design production-ready UIs with aesthetic direction
- `flesch-kincaid-proofreader` — score and simplify prose to a target reading grade
- `update-agents-md` — generate or refresh a repo's `AGENTS.md`
- `compress-skills` — shrink a `SKILL.md`'s context cost with no loss of behavior
- `posthog` — query analytics, LLM spend, and MCP tool quality via PostHog `exec`
- `gog` — automate Gmail, Calendar, Drive, Docs, and Sheets via the `gog` CLI
- `signoz-investigating-alerts` — root-cause a fired SigNoz alert from neighbor signals
- `competitive-ads-extractor` — pull and analyze competitors' ads
- `teach` — explanations that lock in, using two teaching principles
- `visualize` — add a diagram that renders inline in a pi lesson log

`teach` and `visualize` come from the [`learn`](https://github.com/amosblomqvist/learn)
system and use the pi extensions and agents below.

## Layout

```
skills/         Shared skills (SKILL.md + frontmatter). Used by BOTH tools.
scripts/        Repo tooling (skill validator run by CI).
pi/
  extensions/   pi lifecycle extensions (.ts): md-log, quiz, ask-user-question, visual-tools
  agents/       pi subagent definitions: researcher, svg-maker, mermaid-maker
  settings.json pi defaults (provider/model/theme) — bootstrap copy
claude/
  hooks/        Claude Code hook scripts (versioned reference)
  rules/        Rules injected by the hook
  setup.md      Plugins, marketplaces, and hook wiring for Claude Code
```

## How it's wired (symlinks)

The live tool dirs point to this repo, so a skill edit takes effect in both tools at once:

| Live path | → symlink target |
|---|---|
| `~/.claude/skills` | `dotagents/skills` |
| `~/.pi/agent/skills` | `dotagents/skills` |
| `~/.pi/agent/extensions` | `dotagents/pi/extensions` |
| `~/.pi/agent/agents` | `dotagents/pi/agents` |

Some files aren't linked because they're local, hold secrets, or get changed by an app:
`settings.json` for both tools, pi's `auth.json` / `models-store.json` / `sessions/`, and
Claude Code's plugin cache. This repo keeps pi's `settings.json` only as a base copy. See
[`claude/setup.md`](claude/setup.md) for plugins and hooks that aren't symlinked.

## Adding a skill

Drop a folder under `skills/` with a `SKILL.md` — YAML frontmatter (`name` matching the
folder, plus a `description` that says what it does and when to use it), then the guide.
Validate before committing:

```bash
npm run check   # validate every skill's frontmatter + run tests
```

## License

[MIT](LICENSE)
