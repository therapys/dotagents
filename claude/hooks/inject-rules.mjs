#!/usr/bin/env node
// UserPromptSubmit hook for Claude Code.
//
// Reads every Markdown file in the adjacent `rules` directory and emits it as
// additional context. If the directory is missing or empty, the hook is a
// no-op so a broken install never blocks the user's prompt.

import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RULES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'rules')

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
