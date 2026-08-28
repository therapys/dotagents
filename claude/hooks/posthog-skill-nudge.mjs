#!/usr/bin/env node
// Claude Code PreToolUse hook — fires only when the PostHog exec connector is
// invoked (wired in settings.json with matcher `^mcp__claude_ai_PostHog__exec$`).
//
// Once per session it injects a one-line pointer to the `posthog` skill, then
// stays silent so it never repeats across the many exec calls in a single task.
// It only ADDS model-visible context (`additionalContext`) — it never emits a
// `permissionDecision`, so the tool's normal allow/ask flow is untouched.
//
// Any failure is a no-op: the tool always proceeds (empty stdout, exit 0).
//
// Versioned reference copy. The live wiring lives in ~/.claude/settings.json
// (see claude/setup.md); repoint that at this path on a new machine.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

function proceed(context) {
  if (context) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext: context,
        },
      })
    )
  }
  process.exit(0)
}

// Read the hook payload (JSON on stdin, fd 0). Never block the tool on a parse error.
let sessionId = 'unknown'
try {
  sessionId = JSON.parse(readFileSync(0, 'utf-8')).session_id || 'unknown'
} catch {
  /* fall through — still fire the nudge */
}

// Fire at most once per session.
const marker = join(tmpdir(), `posthog-skill-nudge.${sessionId}`)
if (existsSync(marker)) proceed()
try {
  writeFileSync(marker, '')
} catch {
  /* best effort — a failed marker just means the nudge may repeat */
}

proceed(
  'PostHog connector in use. Read the `posthog` skill (~/.claude/skills/posthog/SKILL.md) ' +
    'before composing queries — it has the exec loop, how to read the active project from the ' +
    'connector, and ready-to-run LLM-cost / MCP-quality / analytics query recipes ' +
    '(references/recipes.md).'
)
