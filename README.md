# dotagents

Shared settings for my AI coding tools: **Claude Code** and **pi** ([`@earendil-works/pi-coding-agent`](https://github.com/earendil-works/pi)). Both tools use the same `SKILL.md` format. Skills live in one place, and links share them with both tools. Files used by just one tool live next to the shared files.

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

## Layout

```
skills/         Shared skills (SKILL.md + frontmatter). Used by BOTH tools.
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

## Skills

Build and review code:

- `commit`
- `ship`
- `fix-ci`
- `get-pr-comments`
- `frontend`
- `flesch-kincaid-proofreader`
- `update-agents-md`
- `thermo-nuclear-code-quality-review`
- `competitive-ads-extractor`
- `posthog` — query data, LLM costs, and MCP tool quality via the PostHog `exec` connector; paired with a scoped `PreToolUse` hook (`claude/hooks/posthog-skill-nudge.mjs`, see `claude/setup.md`)
- `gog` — safely automate Gmail, Calendar, Drive, Docs, Sheets, and other Google Workspace services through `gogcli`

Learn with pi:

- `teach`
- `visualize`

The learning skills come from the [`learn`](https://github.com/amosblomqvist/learn) system. They use the pi extensions and agents shown above.

## Bootstrap on a new machine

```bash
git clone <this-repo> ~/.config/dotagents

# Claude Code — share skills
rm -rf ~/.claude/skills && ln -s ~/.config/dotagents/skills ~/.claude/skills

# pi — share skills, extensions, agents
rm -rf ~/.pi/agent/skills      && ln -s ~/.config/dotagents/skills         ~/.pi/agent/skills
rm -rf ~/.pi/agent/extensions  && ln -s ~/.config/dotagents/pi/extensions  ~/.pi/agent/extensions
rm -rf ~/.pi/agent/agents      && ln -s ~/.config/dotagents/pi/agents      ~/.pi/agent/agents

# pi visual-tools extension needs its deps built
( cd ~/.config/dotagents/pi/extensions/visual-tools && npm install )
```

See `claude/setup.md` for plugins/hooks that aren't symlinked.
