#!/usr/bin/env node
// validate-skills — deterministic checks that every skill is well-formed before it ships.
// Both tools (Claude Code + pi) load a skill by its frontmatter `name`/`description`, so a
// missing or mismatched field silently breaks discovery. This catches that in CI and locally.
// No dependencies; Node >= 18.  Exit 0 = all good, 1 = at least one error.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_DIR = path.join(ROOT, 'skills')
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/

const c = { g: '\x1b[32m', y: '\x1b[33m', r: '\x1b[31m', d: '\x1b[2m', x: '\x1b[0m' }
const rel = (p) => path.relative(ROOT, p)

// Minimal YAML-frontmatter reader: the block between the first two `---` fences.
// Handles `key: value`, quoted values, and indented continuation lines (wrapped descriptions).
function readFrontmatter(file) {
  const text = fs.readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/)
  if (lines[0]?.trim() !== '---') return { error: 'missing YAML frontmatter (no opening `---`)' }
  const body = []
  let closed = false
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { closed = true; break }
    body.push(lines[i])
  }
  if (!closed) return { error: 'frontmatter is never closed (no second `---`)' }

  const data = {}
  let lastKey = null
  for (const line of body) {
    if (!line.trim()) continue
    const m = /^([A-Za-z][\w-]*):\s?(.*)$/.exec(line)
    if (m && !/^\s/.test(line)) {
      lastKey = m[1]
      data[lastKey] = unquote(m[2].trim())
    } else if (lastKey && /^\s/.test(line)) {
      data[lastKey] = `${data[lastKey]} ${line.trim()}`.trim()
    }
  }
  return { data }
}

function unquote(v) {
  if (v.length >= 2 && ((v[0] === '"' && v.at(-1) === '"') || (v[0] === "'" && v.at(-1) === "'"))) {
    return v.slice(1, -1)
  }
  return v
}

function main() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`${c.r}✗ no skills/ directory at ${SKILLS_DIR}${c.x}`)
    process.exit(1)
  }
  const dirs = fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

  const errors = []
  const warnings = []
  let ok = 0

  for (const name of dirs) {
    const skillMd = path.join(SKILLS_DIR, name, 'SKILL.md')
    const label = rel(skillMd)
    if (!fs.existsSync(skillMd)) {
      errors.push(`${label}: directory has no SKILL.md`)
      continue
    }
    const { data, error } = readFrontmatter(skillMd)
    if (error) { errors.push(`${label}: ${error}`); continue }

    const problems = []
    if (!data.name) problems.push('frontmatter missing `name`')
    else if (data.name !== name) problems.push(`\`name: ${data.name}\` does not match directory \`${name}\``)
    else if (!KEBAB.test(data.name)) problems.push(`\`name\` is not kebab-case: ${data.name}`)

    if (!data.description) problems.push('frontmatter missing `description`')
    else if (data.description.trim().length < 20) {
      problems.push(`\`description\` is suspiciously short (< 20 chars) — it drives auto-discovery`)
    }

    if (problems.length) { for (const p of problems) errors.push(`${label}: ${p}`) }
    else ok++

    // Non-fatal: very long descriptions cost context on every load.
    if (data.description && data.description.length > 1500) {
      warnings.push(`${label}: description is ${data.description.length} chars — consider /compress-skills`)
    }
  }

  for (const w of warnings) console.log(`${c.y}•${c.x} ${w}`)
  if (errors.length) {
    for (const e of errors) console.error(`${c.r}✗${c.x} ${e}`)
    console.error(`\n${c.r}${errors.length} error(s)${c.x} across ${dirs.length} skill dir(s).`)
    process.exit(1)
  }
  console.log(`${c.g}✓${c.x} ${ok} skill(s) valid${warnings.length ? `, ${warnings.length} warning(s)` : ''}.`)
}

main()
