#!/usr/bin/env node
/**
 * migrate-intro-to-readme.mjs
 *
 * One-shot migration: extracts the `introduction:` template-literal field from
 * every `*.example.ts` file under src/cards/ and writes its content to a
 * `README.md` in the same directory.  The `introduction:` field is then
 * removed from the example file.
 *
 * Safe to re-run: files that already have a README.md and no `introduction:`
 * in the example are skipped silently.
 *
 * Usage:
 *   node scripts/migrate-intro-to-readme.mjs
 *   make migrate-intro          # if a Makefile target is added
 */

import {readdirSync, readFileSync, writeFileSync, existsSync} from "node:fs";
import {join, dirname, relative} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CARDS_DIR = join(ROOT, "src", "cards");

// ---------------------------------------------------------------------------
// File discovery (same logic as gen-playground-registry.mjs)
// ---------------------------------------------------------------------------

function findExampleFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    if (entry.isDirectory()) {
      results.push(...findExampleFiles(join(dir, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith(".example.ts")) {
      results.push(join(dir, entry.name));
    }
  }
  return results.sort();
}

// ---------------------------------------------------------------------------
// Extraction
//
// Matches:
//   introduction: `
//   ...content (may contain \` escaped backticks)...
//   `.trim(),
//
// The inner group uses  (?:[^`\\]|\\.)*  so that \` (escaped backtick) is
// treated as part of the content rather than ending the template literal.
// ---------------------------------------------------------------------------

const INTRO_RE =
  /\n(\s*)introduction:\s*`((?:[^`\\]|\\.)*)`(?:\.trim\(\))?,?\n/s;

/**
 * Convert raw template-literal content to clean markdown:
 *  - Replace escaped backticks  \`  →  `
 *  - Replace escaped dollar-braces  \${  →  ${
 *  - Trim surrounding whitespace
 */
function templateToMarkdown(raw) {
  return raw
    .replace(/\\`/g, "`")
    .replace(/\\\$\{/g, "${")
    .trim();
}

// ---------------------------------------------------------------------------
// Process each file
// ---------------------------------------------------------------------------

const rel = (p) => relative(ROOT, p);

const files = findExampleFiles(CARDS_DIR).filter((f) => {
  const src = readFileSync(f, "utf8");
  return src.includes("definePlayground") && src.includes("introduction:");
});

if (files.length === 0) {
  console.log("✓ Nothing to migrate — no introduction: fields found.");
  process.exit(0);
}

let migrated = 0;
let skipped = 0;

for (const file of files) {
  const cardDir = dirname(file);
  const readmeFile = join(cardDir, "README.md");
  const src = readFileSync(file, "utf8");

  const match = src.match(INTRO_RE);
  if (!match) {
    console.warn(`⚠  Could not parse introduction in ${rel(file)} — skipping`);
    skipped++;
    continue;
  }

  const rawContent = match[2];
  const markdown = templateToMarkdown(rawContent);

  // Write README.md (overwrite if exists — content comes from example anyway)
  writeFileSync(readmeFile, markdown + "\n", "utf8");

  // Remove the introduction: `...`.trim(), block from the example file.
  // Replace the entire matched substring with a single newline so the
  // surrounding blank lines collapse cleanly.
  const updated = src.replace(INTRO_RE, "\n");
  writeFileSync(file, updated, "utf8");

  console.log(`✓  ${rel(file)}`);
  console.log(`   → ${rel(readmeFile)}`);
  migrated++;
}

console.log(
  `\nDone. ${migrated} file${migrated === 1 ? "" : "s"} migrated` +
    (skipped > 0 ? `, ${skipped} skipped` : "") +
    ".",
);
console.log("\nNext step: yarn gen-playground");
