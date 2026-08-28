#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const DEFAULT_TARGET = 8;
const ABBREVIATIONS = new Set([
  "adj", "adm", "adv", "al", "apt", "ave", "capt", "cmdr", "col", "corp",
  "dr", "e.g", "etc", "fig", "gen", "gov", "i.e", "inc", "jr", "lat",
  "lt", "ltd", "maj", "mr", "mrs", "ms", "mt", "no", "prof", "rev",
  "rd", "sen", "sgt", "sr", "st", "vs",
]);

function usage() {
  return `Usage: readability.mjs [options] [file ...]

Calculate the Flesch–Kincaid grade level of English prose. With no files, read stdin.

Options:
  --target <grade>       Target grade used to flag difficult sentences (default: 8)
  --max-sentences <n>    Maximum flagged sentences to print per document (default: 10)
  --include-code         Include Markdown fenced code blocks
  --fail-above           Exit 1 when any document's grade exceeds --target
  --json                 Emit machine-readable JSON
  -h, --help             Show this help
`;
}

function parseArgs(argv) {
  const options = {
    target: DEFAULT_TARGET,
    maxSentences: 10,
    includeCode: false,
    failAbove: false,
    json: false,
    files: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "-h" || arg === "--help") options.help = true;
    else if (arg === "--include-code") options.includeCode = true;
    else if (arg === "--fail-above") options.failAbove = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--target" || arg === "--max-sentences") {
      const value = argv[++index];
      if (value === undefined) throw new Error(`${arg} requires a value`);
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`${arg} must be a non-negative number`);
      if (arg === "--target") options.target = parsed;
      else if (!Number.isInteger(parsed)) throw new Error("--max-sentences must be an integer");
      else options.maxSentences = parsed;
    } else if (arg.startsWith("-")) {
      throw new Error(`unknown option: ${arg}`);
    } else {
      options.files.push(arg);
    }
  }

  return options;
}

export function markdownToProse(markdown, { includeCode = false } = {}) {
  let text = markdown.replace(/\r\n?/g, "\n");

  // README metadata and non-prose constructs should not distort prose scores.
  text = text.replace(/^---\n[\s\S]*?\n---(?:\n|$)/, "\n");
  if (!includeCode) {
    text = text.replace(/^\s*(```|~~~)[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, "\n");
  }

  text = text
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
    .replace(/^[ \t]*\[[^\]]+\]:[ \t]+\S+.*$/gm, " ")
    .replace(/https?:\/\/\S+|www\.\S+/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^[ \t]*\|.*\|[ \t]*$/gm, " ")
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+.*$/gm, " ")
    .replace(/^[ \t]{0,3}>[ \t]*/gm, "")
    .replace(/^[ \t]{0,3}(?:[-+*][ \t]+|\d+[.)][ \t]+)/gm, ". ")
    .replace(/[*_~]/g, "")
    .replace(/\|/g, ". ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/[:;,]\s*\./g, ".")
    .replace(/(?:\.\s*){2,}/g, ". ")
    .trim();

  return text;
}

function protectSentencePeriods(text) {
  return text.replace(/\b(?:[A-Za-z]\.){2,}|\b[A-Za-z][A-Za-z.]*\./g, (match) => {
    const key = match.slice(0, -1).toLowerCase();
    const isInitialism = /^(?:[A-Za-z]\.){2,}$/.test(match);
    const isAbbreviation = ABBREVIATIONS.has(key);
    return isInitialism || isAbbreviation ? match.replaceAll(".", "\u0000") : match;
  });
}

export function splitSentences(text) {
  if (!text.trim()) return [];
  return protectSentencePeriods(text)
    .split(/(?<=[.!?])(?:["')\]]*)\s+|\s*\n+\s*/u)
    .map((sentence) => sentence.replaceAll("\u0000", ".").trim())
    .filter((sentence) => /[\p{L}\p{N}]/u.test(sentence));
}

export function wordsIn(text) {
  return text.match(/[\p{L}]+(?:['’][\p{L}]+)?(?:-[\p{L}]+)*/gu) ?? [];
}

function syllablesInPart(rawPart) {
  const original = rawPart.normalize("NFKD").replace(/\p{M}/gu, "");
  let word = original.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;

  word = word.replace(/(?:'s|’s)$/i, "");
  const vowelGroups = word.match(/[aeiouy]+/g)?.length ?? 0;
  let count = vowelGroups;

  if (/e$/.test(word) && !/(?:le|ye)$/.test(word) && count > 1) count -= 1;
  if (/(?:es|ed)$/.test(word) && !/(?:ted|ded|ses|zes|ches|shes|ces|ges)$/.test(word) && count > 1) count -= 1;
  if (/^mc/.test(word)) count += 1;
  if (/(?:ia|io|eo|ua|iu)/.test(word)) count += 1;

  return Math.max(1, count);
}

export function countSyllables(word) {
  return word.split("-").reduce((total, part) => total + syllablesInPart(part), 0);
}

function round(value, places = 1) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function gradeLevel({ sentences, words, syllables }) {
  if (sentences === 0 || words === 0) return null;
  return 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
}

export function analyzeText(source, options = {}) {
  const target = options.target ?? DEFAULT_TARGET;
  const prose = markdownToProse(source, options);
  const sentenceTexts = splitSentences(prose);
  const sentenceDetails = sentenceTexts.map((text, index) => {
    const words = wordsIn(text);
    const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
    const grade = gradeLevel({ sentences: 1, words: words.length, syllables });
    const complexWords = words
      .map((word) => ({ word, syllables: countSyllables(word) }))
      .filter(({ syllables: count }) => count >= 3)
      .sort((a, b) => b.syllables - a.syllables || b.word.length - a.word.length)
      .slice(0, 5)
      .map(({ word }) => word);

    return {
      number: index + 1,
      text,
      words: words.length,
      syllables,
      grade: grade === null ? null : round(grade),
      complexWords,
    };
  }).filter(({ words }) => words > 0);

  const totals = sentenceDetails.reduce(
    (result, sentence) => ({
      sentences: result.sentences + 1,
      words: result.words + sentence.words,
      syllables: result.syllables + sentence.syllables,
    }),
    { sentences: 0, words: 0, syllables: 0 },
  );
  const grade = gradeLevel(totals);
  const difficultSentences = sentenceDetails
    .filter((sentence) => sentence.grade > target)
    .sort((a, b) => b.grade - a.grade || b.words - a.words || a.number - b.number);

  return {
    ...totals,
    grade: grade === null ? null : round(grade),
    target,
    passes: grade !== null && grade <= target,
    difficultSentences,
  };
}

function printHuman(results, maxSentences) {
  for (const [index, result] of results.entries()) {
    if (index > 0) process.stdout.write("\n");
    process.stdout.write(`${result.file}\n`);
    if (result.grade === null) {
      process.stdout.write("  No prose found.\n");
      continue;
    }
    process.stdout.write(`  Grade ${result.grade} (target ≤ ${result.target}) — ${result.passes ? "PASS" : "REVISE"}\n`);
    process.stdout.write(`  ${result.sentences} sentences · ${result.words} words · ${result.syllables} syllables\n`);

    const flagged = result.difficultSentences.slice(0, maxSentences);
    if (flagged.length > 0) {
      process.stdout.write(`  Difficult sentences (${flagged.length}${result.difficultSentences.length > flagged.length ? ` of ${result.difficultSentences.length}` : ""}):\n`);
      for (const sentence of flagged) {
        const complex = sentence.complexWords.length > 0 ? `; complex: ${sentence.complexWords.join(", ")}` : "";
        process.stdout.write(`    ${sentence.number}. grade ${sentence.grade}, ${sentence.words} words${complex}\n`);
        process.stdout.write(`       ${sentence.text}\n`);
      }
    }
  }
}

function readDocuments(files) {
  if (files.length === 0) return [{ file: "<stdin>", text: fs.readFileSync(0, "utf8") }];
  return files.map((file) => ({ file, text: fs.readFileSync(file, "utf8") }));
}

export function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArgs(argv);
    if (options.help) {
      process.stdout.write(usage());
      return 0;
    }

    const results = readDocuments(options.files).map(({ file, text }) => ({
      file,
      ...analyzeText(text, options),
    }));

    if (options.json) process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
    else printHuman(results, options.maxSentences);

    const hasFailure = results.some((result) => result.grade === null || result.grade > options.target);
    return options.failAbove && hasFailure ? 1 : 0;
  } catch (error) {
    process.stderr.write(`readability: ${error.message}\n`);
    return 2;
  }
}

const isEntryPoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) process.exitCode = main();
