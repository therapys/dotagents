# Claude Code setup

Claude Code's config dir (`~/.claude`) holds secrets, sessions, and plugin caches, so it is **not** a git repo. Only the portable parts live here in `dotagents`:

- **Skills** — `~/.claude/skills` is a symlink → `dotagents/skills` (shared with pi).
- **Hooks** — versioned copies in `claude/hooks/` and `claude/rules/`.
- **Plugins / marketplaces** — captured below as a bootstrap list (the plugin *code* is installed on demand into `~/.claude/plugins`, not versioned).

## Enabled plugins (`~/.claude/settings.json` → `enabledPlugins`)

| plugin | enabled |
|---|---|
| `github@claude-plugins-official` | ✅ |
| `typescript-lsp@claude-plugins-official` | ✅ |
| `claude-code-setup@claude-plugins-official` | ✅ |
| `security-guidance@claude-plugins-official` | ❌ |
| `swift-lsp@claude-plugins-official` | ❌ |

Marketplace: `claude-plugins-official` → github `anthropics/claude-plugins-official`. `extraKnownMarketplaces` is empty.

## Hook wiring (`~/.claude/settings.json` → `hooks`)

```json
"hooks": {
  "UserPromptSubmit": [
    { "hooks": [ { "type": "command", "command": "node ~/.blume/hooks/inject-rules.mjs" } ] }
  ]
}
```

`inject-rules.mjs` is managed by the Blume tool (`~/.blume`); the copy in `claude/hooks/` is a versioned reference. The rule it injects (`claude/rules/todo-list.md`) is the "every multi-step request needs a todo list" directive. The live setting still points at `~/.blume` so Blume updates don't break — repoint it to this repo's copy only if you drop Blume.

## Bootstrap on a new machine

```bash
git clone <this-repo> ~/.config/dotagents
# share skills into Claude Code
rm -rf ~/.claude/skills && ln -s ~/.config/dotagents/skills ~/.claude/skills
# re-enable plugins per the table above via /plugin, and wire the hook in settings.json
```
