import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  analyzeText,
  countSyllables,
  gradeLevel,
  markdownToProse,
  splitSentences,
  wordsIn,
} from "../scripts/readability.mjs";

const script = fileURLToPath(new URL("../scripts/readability.mjs", import.meta.url));

test("implements the Flesch–Kincaid grade-level formula", () => {
  const grade = gradeLevel({ sentences: 2, words: 20, syllables: 30 });
  assert.ok(Math.abs(grade - 6.01) < Number.EPSILON * 10);
});

test("counts common English syllable patterns deterministically", () => {
  assert.equal(countSyllables("cat"), 1);
  assert.equal(countSyllables("table"), 2);
  assert.equal(countSyllables("baked"), 1);
  assert.equal(countSyllables("readability"), 5);
  assert.equal(countSyllables("well-written"), 3);
});

test("extracts words with apostrophes and hyphens", () => {
  assert.deepEqual(wordsIn("It's a well-written README."), ["It's", "a", "well-written", "README"]);
});

test("does not split common abbreviations into sentences", () => {
  assert.deepEqual(splitSentences("Use tools, e.g. scripts. Then check the result."), [
    "Use tools, e.g. scripts.",
    "Then check the result.",
  ]);
});

test("removes Markdown code blocks, URLs, and syntax while retaining visible copy", () => {
  const markdown = `---
title: Hidden metadata
---
# Clear docs

Read the [setup guide](https://example.com/setup).

- Keep this prose.

\`npm install\`

\`\`\`js
const implementationDetail = true;
\`\`\`
`;
  const prose = markdownToProse(markdown);
  assert.match(prose, /Read the setup guide/);
  assert.match(prose, /Keep this prose/);
  assert.match(prose, /npm install/);
  assert.doesNotMatch(prose, /Hidden metadata|Clear docs|implementationDetail|https/);
});

test("calculates document totals and ranks difficult sentences", () => {
  const result = analyzeText(
    "Cats chase mice. Institutionalization complicates interdisciplinary communication significantly.",
    { target: 5 },
  );
  assert.equal(result.sentences, 2);
  assert.equal(result.words, 8);
  assert.equal(result.difficultSentences[0].number, 2);
  assert.equal(result.passes, false);
});

test("CLI emits JSON and enforces the target when requested", () => {
  const run = spawnSync(
    process.execPath,
    [script, "--json", "--target", "0", "--fail-above"],
    { input: "This documentation contains unnecessarily complicated terminology.", encoding: "utf8" },
  );
  assert.equal(run.status, 1);
  const [result] = JSON.parse(run.stdout);
  assert.equal(result.file, "<stdin>");
  assert.equal(result.target, 0);
  assert.equal(result.passes, false);
});
