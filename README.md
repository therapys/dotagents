<div align="center">

# dotagents

**One set of skills for [Claude Code](https://github.com/anthropics/claude-code) and [pi](https://github.com/earendil-works/pi). Edit once — both tools update.**

[![CI](https://github.com/therapys/dotagents/actions/workflows/ci.yml/badge.svg)](https://github.com/therapys/dotagents/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](package.json)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

```bash
npx github:therapys/dotagents install
```

</div>

---

Shared settings for my AI coding tools. Both Claude Code and pi read the same `SKILL.md`
format, so skills live in **one place** and symlinks share them with both tools. Files used
by only one tool live next to the shared ones.

## Why

- **One format, two tools.** A skill is a folder with a `SKILL.md`. Symlinks point the live
  tool directories at this repo, so a single edit takes effect in Claude Code *and* pi at once.
- **Zero dependencies, reversible install.** The installer is one dependency-free Node file.
  It backs up anything it would replace to `*.pre-dotagents` and restores it on `uninstall` —
  it never clobbers your existing config.
- **Batteries included.** Skills for shipping code, reviewing PRs, wrangling analytics, and
  learning — plus Claude Code hooks, pi extensions, and subagents.

## Install (npx)

```bash
npx github:therapys/dotagents install     # clone + symlink into ~/.claude and ~/.pi
npx github:therapys/dotagents update      # git pull the latest
npx github:therapys/dotagents uninstall   # remove symlinks (restore backups); --purge also deletes the clone
npx github:therapys/dotagents status      # show repo + symlink state
```

`install` does the following:

- Clones the repo to `~/.config/dotagents`.
- Lets you pick a new path with `[dir]`, `--dir <path>`, or `DOTAGENTS_DIR`. The default path is `$XDG_CONFIG_HOME/dotagents`.
- Saves old `skills`, `extensions`, and `agents` dirs as `*.pre-dotagents`.
- Links the live tool paths to this repo.
- Runs `npm install` for each extension with a `package.json`.

You can run `install` more than once. Use `--skip-npm` to skip npm installs. Set `DOTAGENTS_REPO` to use a fork.

`uninstall` removes the links and puts each `*.pre-dotagents` backup back in place. Use `--purge` to also delete the clone.

> **Note:** `visual-tools` installs Puppeteer and mermaid-cli. They use about 460 MB in the gitignored `node_modules` dir. Puppeteer gets Chromium through a `postinstall` script. If npm blocks install scripts with `allowScripts`, it will not get the browser. Run `npm install-scripts approve puppeteer` in that dir to allow it. You can also set `PUPPETEER_EXECUTABLE_PATH` to a system copy of Chrome.

## Skills

Each skill is a folder under `skills/` with a `SKILL.md`. Both tools load it by its
frontmatter, so the description is the trigger.

**Build & review code**

| Skill | What it does |
|---|---|
| `commit` | Write a clean Conventional Commit for your staged changes. |
| `ship` | Dirty tree → branch, commit, push, and open the PR in one shot. |
| `fix-ci` | Find failing PR checks, read the logs, apply focused fixes. |
| `get-pr-comments` | Fetch and summarize review comments on the active PR. |
| `thermo-nuclear-code-quality-review` | A brutally strict maintainability audit — abstractions, giant files, spaghetti conditions. |
| `frontend` | Design distinctive, production-ready UIs with real aesthetic direction. |
| `flesch-kincaid-proofreader` | Score and simplify prose to a target reading grade (deterministic script + tests). |
| `update-agents-md` | Generate or refresh a repo's `AGENTS.md` and its `CLAUDE.md` pointer. |
| `compress-skills` | Shrink a `SKILL.md`'s context cost with **zero** loss of behavior. |

**Data, ops & growth**

| Skill | What it does |
|---|---|
| `posthog` | Query analytics, LLM spend, and MCP tool quality via the PostHog `exec` connector. Paired with a scoped `PreToolUse` hook. |
| `gog` | Safely automate Gmail, Calendar, Drive, Docs, and Sheets through the `gog` CLI. |
| `signoz-investigating-alerts` | Root-cause a fired SigNoz alert by correlating neighbor signals, traces, and logs. |
| `competitive-ads-extractor` | Pull and analyze competitors' ads to sharpen your own campaigns. |

**Learn with pi**

| Skill | What it does |
|---|---|
| `teach` | Explanations that actually lock in, using two proven teaching principles. |
| `visualize` | Add a correct, minimal diagram that renders inline in your lesson log. |

The learning skills come from the [`learn`](https://github.com/amosblomqvist/learn) system.
They use the pi extensions and agents shown below.

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

The live tool dirs point to this repo. A skill edit takes effect in both tools at once:

| Live path | → symlink target |
|---|---|
| `~/.claude/skills` | `dotagents/skills` |
| `~/.pi/agent/skills` | `dotagents/skills` |
| `~/.pi/agent/extensions` | `dotagents/pi/extensions` |
| `~/.pi/agent/agents` | `dotagents/pi/agents` |

Some files are not linked because they are local, hold secrets, or may be changed by an app:

- `settings.json` for both tools.
- pi's `auth.json`, `models-store.json`, and `sessions/`.
- Claude Code's plugin cache.

This repo keeps pi's `settings.json` only as a base copy.

## Bootstrap on a new machine

```bash
git clone https://github.com/therapys/dotagents.git ~/.config/dotagents

# Claude Code — share skills
rm -rf ~/.claude/skills && ln -s ~/.config/dotagents/skills ~/.claude/skills

# pi — share skills, extensions, agents
rm -rf ~/.pi/agent/skills      && ln -s ~/.config/dotagents/skills         ~/.pi/agent/skills
rm -rf ~/.pi/agent/extensions  && ln -s ~/.config/dotagents/pi/extensions  ~/.pi/agent/extensions
rm -rf ~/.pi/agent/agents      && ln -s ~/.config/dotagents/pi/agents      ~/.pi/agent/agents

# pi visual-tools extension needs its deps built
( cd ~/.config/dotagents/pi/extensions/visual-tools && npm install )
```

See [`claude/setup.md`](claude/setup.md) for plugins/hooks that aren't symlinked.

## Contributing

New skills are the most useful thing you can add. See [CONTRIBUTING.md](CONTRIBUTING.md) for
the layout and the frontmatter contract, then run:

```bash
npm run check   # validate every skill's frontmatter + run tests (same as CI)
```

Please keep skills portable — no company names, secrets, or machine-specific paths. See
[SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) — if this saves you time, a ⭐ helps others find it.
