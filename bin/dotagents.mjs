#!/usr/bin/env node
// dotagents — install / uninstall / update the shared agent config for Claude Code + pi.
// No dependencies; Node >= 18. Repo dir: [dir] arg > $DOTAGENTS_DIR > $XDG_CONFIG_HOME/dotagents (~/.config/dotagents).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const HOME = os.homedir()
const XDG = process.env.XDG_CONFIG_HOME || path.join(HOME, '.config')
const expand = (p) => (p && p.startsWith('~/') ? path.join(HOME, p.slice(2)) : p)

// Repo dir precedence: explicit [dir]/--dir on the command > $DOTAGENTS_DIR > $XDG_CONFIG_HOME/dotagents.
function pickRepoDir() {
  const a = process.argv.slice(3) // args after the command
  const i = a.indexOf('--dir')
  if (i !== -1 && a[i + 1]) return a[i + 1]
  const positional = a.find((x) => !x.startsWith('-'))
  return positional || process.env.DOTAGENTS_DIR || path.join(XDG, 'dotagents')
}
const REPO_DIR = path.resolve(expand(pickRepoDir()))
const REPO_URL = process.env.DOTAGENTS_REPO || 'https://github.com/therapys/dotagents.git'

// [ path inside repo, live path a tool reads, tool base dir that must exist to link ]
const LINKS = [
  ['skills', path.join(HOME, '.claude', 'skills'), path.join(HOME, '.claude')],
  ['skills', path.join(HOME, '.pi', 'agent', 'skills'), path.join(HOME, '.pi')],
  ['pi/extensions', path.join(HOME, '.pi', 'agent', 'extensions'), path.join(HOME, '.pi')],
  ['pi/agents', path.join(HOME, '.pi', 'agent', 'agents'), path.join(HOME, '.pi')],
]

const c = { g: '\x1b[32m', y: '\x1b[33m', r: '\x1b[31m', d: '\x1b[2m', x: '\x1b[0m' }
const ok = (m) => console.log(`${c.g}✓${c.x} ${m}`)
const warn = (m) => console.log(`${c.y}•${c.x} ${m}`)
const info = (m) => console.log(`${c.d}${m}${c.x}`)
const die = (m) => { console.error(`${c.r}✗ ${m}${c.x}`); process.exit(1) }
const tilde = (p) => p.replace(HOME, '~')

const git = (args, cwd) => execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim()
const isRepo = (dir) => fs.existsSync(path.join(dir, '.git'))
const lstat = (p) => { try { return fs.lstatSync(p) } catch { return null } }
// Absolute path a symlink resolves to, or null if p isn't a symlink.
const resolveLink = (p) => { try { return path.resolve(path.dirname(p), fs.readlinkSync(p)) } catch { return null } }
// Is absolute path p the repo root or inside it? (path.sep boundary avoids matching sibling `dotagents-old`.)
const inRepo = (p) => { const r = path.resolve(REPO_DIR), a = path.resolve(p); return a === r || a.startsWith(r + path.sep) }

function ensureRepo() {
  if (isRepo(REPO_DIR)) { info(`repo present at ${tilde(REPO_DIR)}`); return }
  if (fs.existsSync(REPO_DIR)) die(`${tilde(REPO_DIR)} exists but is not a git repo — move it aside or set DOTAGENTS_DIR.`)
  info(`cloning ${REPO_URL} → ${tilde(REPO_DIR)}`)
  fs.mkdirSync(path.dirname(REPO_DIR), { recursive: true })
  git(['clone', REPO_URL, REPO_DIR])
  ok(`cloned into ${tilde(REPO_DIR)}`)
}

function linkOne(sub, live, guard) {
  const target = path.join(REPO_DIR, sub)
  const label = tilde(live)
  if (!fs.existsSync(guard)) return warn(`skip ${label} (${tilde(guard)} not present)`)
  if (!fs.existsSync(target)) return warn(`skip ${label} (missing ${sub} in repo)`)
  fs.mkdirSync(path.dirname(live), { recursive: true })
  const st = lstat(live)
  if (st && st.isSymbolicLink()) {
    if (resolveLink(live) === path.resolve(target)) return info(`already linked ${label}`)
    fs.unlinkSync(live) // stale/foreign-in-repo symlink; replace
  } else if (st) {
    let bak = `${live}.pre-dotagents`
    if (fs.existsSync(bak)) bak = `${bak}.${Date.now()}`
    fs.renameSync(live, bak)
    warn(`backed up existing ${label} → ${tilde(bak)}`)
  }
  fs.symlinkSync(target, live)
  ok(`linked ${label} → ${tilde(target)}`)
}

function unlinkOne(live) {
  const label = tilde(live)
  const st = lstat(live)
  const bak = `${live}.pre-dotagents`
  if (st && st.isSymbolicLink()) {
    const to = resolveLink(live)
    if (to && inRepo(to)) { fs.unlinkSync(live); ok(`unlinked ${label}`) }
    else return warn(`skip ${label} (symlink not managed by dotagents — left as-is)`)
  } else if (st) {
    return warn(`skip ${label} (real dir, not a dotagents symlink — left untouched)`)
  } else {
    info(`nothing at ${label}`)
  }
  // Restore the pre-install original if we took one.
  if (fs.existsSync(bak)) { fs.renameSync(bak, live); ok(`restored ${label} from ${tilde(bak)}`) }
  else info(`no backup for ${label} — nothing to restore`)
}

const uniqueLives = () => [...new Map(LINKS.map(([, live]) => [live, live])).values()]

// Every dir under the repo that holds a package.json (excluding the repo root and node_modules).
function packageDirs() {
  const found = []
  const skip = new Set(['node_modules', '.git'])
  const walk = (dir) => {
    if (fs.existsSync(path.join(dir, 'package.json')) && path.resolve(dir) !== path.resolve(REPO_DIR)) found.push(dir)
    let entries
    try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const e of entries) if (e.isDirectory() && !skip.has(e.name)) walk(path.join(dir, e.name))
  }
  walk(REPO_DIR)
  return found
}

const tryNpm = (args, cwd) => {
  try { execFileSync('npm', args, { cwd, stdio: 'inherit' }); return true } catch { return false }
}

// --no-save/--no-package-lock keep tracked package.json + lockfiles pristine; deps land in (gitignored) node_modules.
function npmInstalls() {
  const dirs = packageDirs()
  if (!dirs.length) return
  const base = ['--no-audit', '--no-fund', '--no-save', '--no-package-lock']
  for (const dir of dirs) {
    const label = tilde(dir)
    info(`npm install — ${label}`)
    if (tryNpm(['install', '--omit=dev', ...base], dir)) ok(`deps ready — ${label}`)
    else if (tryNpm(['install', ...base], dir)) ok(`deps ready (incl. dev) — ${label}`)
    else warn(`npm install failed — ${label} (install its deps manually if you use this extension)`)
  }
}

function install() {
  ensureRepo()
  for (const [sub, live, guard] of LINKS) linkOne(sub, live, guard)
  if (!process.argv.includes('--skip-npm')) npmInstalls()
  console.log()
  info('Plugins & hooks are not symlinked — see claude/setup.md to finish Claude Code wiring.')
}

function uninstall() {
  for (const live of uniqueLives()) unlinkOne(live)
  if (isRepo(REPO_DIR)) {
    if (process.argv.includes('--purge')) { fs.rmSync(REPO_DIR, { recursive: true, force: true }); ok(`removed clone ${tilde(REPO_DIR)}`) }
    else info(`clone left at ${tilde(REPO_DIR)} (add --purge to delete it)`)
  }
}

function update() {
  if (!isRepo(REPO_DIR)) die(`no clone at ${tilde(REPO_DIR)} — run \`install\` first.`)
  const before = git(['rev-parse', '--short', 'HEAD'], REPO_DIR)
  try { git(['pull', '--ff-only'], REPO_DIR) }
  catch (e) { die(`pull failed: ${(e.stderr?.toString() || e.message).trim()}`) }
  const after = git(['rev-parse', '--short', 'HEAD'], REPO_DIR)
  ok(before === after ? `already up to date (${after})` : `updated ${before} → ${after}`)
  if (before !== after && !process.argv.includes('--skip-npm')) npmInstalls()
}

function status() {
  info(`repo:   ${tilde(REPO_DIR)}`)
  if (isRepo(REPO_DIR)) {
    let remote = '(none)'
    try { remote = git(['remote', 'get-url', 'origin'], REPO_DIR) } catch {}
    info(`remote: ${remote}`)
    info(`HEAD:   ${git(['log', '-1', '--pretty=%h %s'], REPO_DIR)}`)
  } else warn('not cloned yet')
  console.log()
  for (const live of uniqueLives()) {
    const label = tilde(live)
    const st = lstat(live)
    if (st && st.isSymbolicLink()) {
      const to = resolveLink(live) || ''
      to && inRepo(to) ? ok(`${label} → ${tilde(to)}`) : warn(`${label} → ${tilde(to)} (foreign)`)
    } else if (st) warn(`${label} (real dir, not linked)`)
    else info(`${label} (absent)`)
  }
}

const HELP = `dotagents — shared skills/hooks/extensions for Claude Code + pi

Usage: npx github:therapys/dotagents <command> [dir] [flags]

  install [dir] [--skip-npm]  clone into <dir>, symlink into ~/.claude and ~/.pi, npm-install extension deps
  update  [--skip-npm]        git pull, then npm-install extension deps if anything changed
  uninstall [--purge]         remove the symlinks (restore backups); --purge also deletes the clone
  status                      show repo + symlink state

Repo dir defaults to ~/.config/dotagents ($XDG_CONFIG_HOME/dotagents); override with [dir], --dir <path>, or $DOTAGENTS_DIR.
Existing real dirs are backed up to <path>.pre-dotagents before linking.
Env: DOTAGENTS_REPO overrides the clone URL.`

const cmd = process.argv[2]
try {
  if (cmd === 'install') install()
  else if (cmd === 'uninstall' || cmd === 'remove') uninstall()
  else if (cmd === 'update') update()
  else if (cmd === 'status') status()
  else {
    console.log(HELP)
    if (cmd && !['help', '-h', '--help'].includes(cmd)) process.exit(1)
  }
} catch (e) {
  die(e.stack || e.message)
}
