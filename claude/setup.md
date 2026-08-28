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
    { "hooks": [ { "type": "command", "command": "node ~/.config/dotagents/claude/hooks/inject-rules.mjs" } ] }
  ],
  "PreToolUse": [
    {
      "matcher": "^mcp__claude_ai_PostHog__exec$",
      "hooks": [ { "type": "command", "command": "node ~/.config/dotagents/claude/hooks/posthog-skill-nudge.mjs" } ]
    }
  ]
}
```

`inject-rules.mjs` loads the portable rule set directly from `claude/rules/`. It covers task tracking, deterministic work, safe system changes, verification, clarifying questions, public artifacts, and display.dev previews. Because Claude Code runs the versioned hook from this repo, rule changes take effect without a separate sync step.

`posthog-skill-nudge.mjs` is a `PreToolUse` hook scoped to the PostHog `exec` connector. The first time that tool is used in a session it injects a one-line pointer to the `posthog` skill (`additionalContext` only — it never sets `permissionDecision`, so the tool's normal allow/ask flow is untouched), then stays silent for the rest of the session. Zero cost on non-PostHog work — that's why it's a scoped `PreToolUse` hook rather than an always-on injected rule. It pairs with the `posthog` skill's own description-based auto-trigger as a belt-and-suspenders guarantee.

## Bootstrap on a new machine

```bash
git clone <this-repo> ~/.config/dotagents
# share skills into Claude Code
rm -rf ~/.claude/skills && ln -s ~/.config/dotagents/skills ~/.claude/skills
# re-enable plugins per the table above via /plugin, and wire the hook in settings.json
```
