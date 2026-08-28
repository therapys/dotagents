/**
 * Shared helpers for the visual-tools authoring loops (mermaid_tools.ts,
 * svg_tools.ts): a subprocess runner, a per-session managed source file, an
 * exact-match editor (pi-edit semantics), and publishing a chosen render into
 * <cwd>/viz with a unique filename.
 *
 * Each tool file keeps its OWN session state (importing the type/helpers here),
 * so mermaid and svg never share a source file.
 */

import { spawn } from "node:child_process"
import { tmpdir } from "node:os"
import { basename, dirname, join } from "node:path"
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"

// rsvg-convert lives under MacPorts (/opt/local/bin); magick/gs under
// /usr/local/bin; Homebrew under /opt/homebrew/bin. Augment PATH so the child
// pi process (which may have inherited a thin PATH) still resolves them.
export const EXTRA_PATH = ["/opt/local/bin", "/usr/local/bin", "/opt/homebrew/bin"]

// Transient session/preview files live under the OS temp dir (NOT the vault),
// so only the PUBLISHED PNG ever lands inside the Obsidian vault (viz/).
export const STAGING_ROOT = join(tmpdir(), "pi-visual-tools")
export const FILES_DIRNAME = "viz"

export const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
]

export function findChrome(): string | undefined {
  for (const c of CHROME_CANDIDATES) if (existsSync(c)) return c
  return undefined
}

export interface RunResult {
  code: number | null
  stdout: string
  stderr: string
  timedOut: boolean
}

export function run(
  cmd: string,
  args: string[],
  opts: { cwd: string; timeoutMs: number; env?: Record<string, string> },
): Promise<RunResult> {
  return new Promise((resolveRun) => {
    const augmentedPath = [...EXTRA_PATH, process.env.PATH ?? ""].join(":")
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: { ...process.env, ...(opts.env ?? {}), PATH: augmentedPath },
    })
    let stdout = ""
    let stderr = ""
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      child.kill("SIGKILL")
    }, opts.timeoutMs)
    child.stdout.on("data", (d) => (stdout += d.toString()))
    child.stderr.on("data", (d) => (stderr += d.toString()))
    child.on("error", (err) => {
      clearTimeout(timer)
      resolveRun({ code: null, stdout, stderr: stderr + String(err), timedOut })
    })
    child.on("close", (code) => {
      clearTimeout(timer)
      resolveRun({ code, stdout, stderr, timedOut })
    })
  })
}

/** Per-session managed source file, one per child pi process (pid-keyed). */
export interface Session {
  workDir: string
  bodyPath: string
}

/** Per-session work dir under the OS temp dir, keyed by pid + a group name. */
export function sessionDir(group: string): string {
  return join(STAGING_ROOT, `${group}-${process.pid}`)
}

/** Write the full source to the managed file, creating the session work dir. */
export function writeBody(group: string, bodyFileName: string, source: string): Session {
  const workDir = sessionDir(group)
  mkdirSync(workDir, { recursive: true })
  const bodyPath = join(workDir, bodyFileName)
  writeFileSync(bodyPath, source, "utf8")
  return { workDir, bodyPath }
}

/**
 * Exact-match single replacement on the current source, matching pi's built-in
 * edit: old_text must appear exactly once. Returns the updated content and the
 * match offset, or throws a precise error.
 */
export function applyEdit(current: string, oldText: string, newText: string): { updated: string; index: number } {
  if (oldText === "") throw new Error("`old_text` must be non-empty.")
  if (oldText === newText) throw new Error("`old_text` and `new_text` are identical.")
  const first = current.indexOf(oldText)
  if (first === -1) {
    throw new Error("`old_text` not found in the current source — match it exactly.")
  }
  const second = current.indexOf(oldText, first + 1)
  if (second !== -1) {
    let n = 0
    let i = current.indexOf(oldText)
    while (i !== -1) {
      n++
      i = current.indexOf(oldText, i + oldText.length)
    }
    throw new Error(`\`old_text\` appears ${n} times — add surrounding context to make it unique.`)
  }
  const updated = current.slice(0, first) + newText + current.slice(first + oldText.length)
  return { updated, index: first }
}

/** A small numbered window of `content` around char offset `index`. */
export function snippetAround(content: string, index: number, contextLines = 3): string {
  const before = content.slice(0, index)
  const hitLine = before.split("\n").length - 1
  const lines = content.split("\n")
  const start = Math.max(0, hitLine - contextLines)
  const end = Math.min(lines.length - 1, hitLine + contextLines)
  const width = String(end + 1).length
  const out: string[] = []
  for (let i = start; i <= end; i++) out.push(`${String(i + 1).padStart(width)}  ${lines[i]}`)
  return out.join("\n")
}

/** Copy a rendered PNG into <cwd>/viz with a unique, slugified name. */
export function publish(pngPath: string, slug: string): { filename: string; path: string } {
  const filesDir = join(process.cwd(), FILES_DIRNAME)
  mkdirSync(filesDir, { recursive: true })
  const clean =
    slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "viz"
  const filename = `viz-${clean}-${Date.now()}.png`
  const dest = join(filesDir, filename)
  copyFileSync(pngPath, dest)
  return { filename, path: dest }
}

export { basename, dirname, join, existsSync, mkdirSync, readFileSync, writeFileSync }
