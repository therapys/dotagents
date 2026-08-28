#!/usr/bin/env node
// Blume UserPromptSubmit hook for Claude Code.
//
// Reads every rule file under `~/.blume/rules/` and emits them as additional
// context for the model. The hook is invoked once per user prompt; if the
// rules directory is missing or empty, the hook is a no-op so a broken Blume
// install never blocks the user's prompt.
//
// Owned by the Blume app — re-installed on every app launch. Hand-edits will
// be overwritten.

import { readdir, readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const RULES_DIR = join(homedir(), '.blume', 'rules')

async function loadRules() {
  let entries
  try {
    entries = await readdir(RULES_DIR, { withFileTypes: true })
  } catch {
    return []
  }
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => e.name)
    .sort()
  const contents = await Promise.all(
    files.map((name) => readFile(join(RULES_DIR, name), 'utf-8').catch(() => null))
  )
  return contents.filter((c) => typeof c === 'string' && c.trim().length > 0)
}

const rules = await loadRules()
if (rules.length === 0) process.exit(0)

const body = rules.map((r) => r.trim()).join('\n\n')

// Hook protocol: stdout is appended to the prompt as additional context.
process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: body
    }
  })
)
