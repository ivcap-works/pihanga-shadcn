#!/usr/bin/env node
/**
 * gen-playground-registry.mjs
 *
 * Scans every sub-directory of src/cards/ for *.example.ts files that contain
 * a `definePlayground()` default export, then writes a static TypeScript module
 * at src/playground/playground.examples.gen.ts that re-exports them as a plain
 * array.
 *
 * Unlike the dynamic registry (src/playground/registry.ts), the generated file
 * has no runtime side-effects and is resolved entirely at build time — making
 * it safe for static-site generation, bundle analysis, and tree-shaking.
 *
 * README injection
 * ────────────────
 * When a card folder contains a `README.md` alongside the `*.example.ts` file,
 * the generated code imports it with Vite's `?raw` suffix (returning the file
 * content as a plain string) and spreads it into the playground definition as
 * `introduction`.  This overrides any `introduction` field authored inline in
 * the example file, so the single source of truth for card descriptions is the
 * README.
 *
 * Usage:
 *   node scripts/gen-playground-registry.mjs
 *   yarn gen-playground
 *   make gen-playground
 */

import {readdirSync, readFileSync, writeFileSync, existsSync} from "node:fs";
import {join, relative, dirname} from "node:path";
import {fileURLToPath} from "node:url";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CARDS_DIR = join(ROOT, "src", "cards");
const OUTPUT_PATH = join(
  ROOT,
  "src",
  "playground",
  "playground.examples.gen.ts",
);

// ---------------------------------------------------------------------------
// Step 1 — discover all *.example.ts files under src/cards/
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
  return results.sort(); // deterministic, alphabetical
}

// ---------------------------------------------------------------------------
// Step 2 — filter to files that actually export a PlaygroundDef
//           (i.e. contain both "export default" and "definePlayground")
// ---------------------------------------------------------------------------

function usesDefinePlayground(filePath) {
  const src = readFileSync(filePath, "utf8");
  return src.includes("export default") && src.includes("definePlayground");
}

// ---------------------------------------------------------------------------
// Step 3 — derive a unique camelCase import alias from the card folder name
//
//   badge/badge.example.ts           → badgeDef
//   input/input.example.ts           → inputDef
//   dropDownMenu/drop-down.example.ts → dropDownMenuDef
// ---------------------------------------------------------------------------

function toAlias(filePath) {
  // Use the containing card folder, not the filename, to avoid collisions
  // when a card folder contains multiple example files.
  const cardFolder = relative(CARDS_DIR, filePath).split("/")[0];
  const camel =
    cardFolder[0].toLowerCase() +
    cardFolder.slice(1).replace(/-([a-zA-Z])/g, (_, c) => c.toUpperCase());
  return `${camel}Def`;
}

function toImportPath(filePath) {
  // Vite alias @/ → src/
  const rel = relative(join(ROOT, "src"), filePath).replace(/\.ts$/, "");
  return `@/${rel}`;
}

// ---------------------------------------------------------------------------
// Step 4 — README detection helpers
// ---------------------------------------------------------------------------

/** Returns the absolute path to README.md in the same folder as the example. */
function readmePath(filePath) {
  return join(dirname(filePath), "README.md");
}

/** True when a README.md sits alongside the example file. */
function hasReadme(filePath) {
  return existsSync(readmePath(filePath));
}

/** camelCase alias for the README raw import (e.g. badgeReadme). */
function toReadmeAlias(filePath) {
  return toAlias(filePath).replace(/Def$/, "Readme");
}

/** `@/cards/<folder>/README.md?raw` — Vite raw string import. */
function toReadmeImportPath(filePath) {
  const rel = relative(join(ROOT, "src"), readmePath(filePath));
  return `@/${rel}?raw`;
}

// ---------------------------------------------------------------------------
// Step 5 — generate the output file
// ---------------------------------------------------------------------------

const allExamples = findExampleFiles(CARDS_DIR);
const eligible = allExamples.filter(usesDefinePlayground);

if (eligible.length === 0) {
  console.warn(
    "⚠  No definePlayground() default exports found under src/cards/.\n" +
      "   Nothing written.",
  );
  process.exit(0);
}

// Build import lines — def imports first, then README raw imports
const defImportLines = eligible.map(
  (f) => `import ${toAlias(f)} from "${toImportPath(f)}";`,
);

const readmeImportLines = eligible
  .filter(hasReadme)
  .map((f) => `import ${toReadmeAlias(f)} from "${toReadmeImportPath(f)}";`);

// Build array entries — spread README content as `introduction` when available
const entryLines = eligible.map((f) => {
  if (hasReadme(f)) {
    return `  {...${toAlias(f)}, introduction: ${toReadmeAlias(f)}},`;
  }
  return `  ${toAlias(f)},`;
});

const banner = `\
// ============================================================================
// AUTO-GENERATED — do not edit by hand.
//
// Regenerate with:
//   yarn gen-playground
//   node scripts/gen-playground-registry.mjs
//   make gen-playground
//
// Source: every src/cards/**/*.example.ts that contains a
//         \`definePlayground()\` default export.
//
// README injection: when a card folder contains a README.md, its content is
// imported with Vite's \`?raw\` suffix and merged into the definition as the
// \`introduction\` field (overriding any inline value in the example file).
//
// Last generated: ${new Date().toISOString()}
// ============================================================================
`;

const generated =
  banner +
  `
import type {PlaygroundDef} from "./playground.types";
${defImportLines.join("\n")}
${readmeImportLines.length > 0 ? "\n" + readmeImportLines.join("\n") : ""}
/**
 * Static list of all playground definitions discovered at code-generation time.
 *
 * Unlike the dynamic \`registry.ts\` (populated at runtime via
 * \`registerPlaygroundDef()\`), this array is resolved at build time and is
 * therefore safe for static-site generation, bundle analysis, and tree-shaking.
 *
 * The playground engine can use either this list or the dynamic registry —
 * see \`src/playground/registry.ts\` for the runtime alternative.
 *
 * Cards that ship a \`README.md\` alongside their \`*.example.ts\` have their
 * README content injected automatically as the \`introduction\` field.
 */
export const PLAYGROUND_EXAMPLES: PlaygroundDef[] = [
${entryLines.join("\n")}
];
`;

writeFileSync(OUTPUT_PATH, generated, "utf8");

const rel = (p) => relative(ROOT, p);
const withReadme = eligible.filter(hasReadme);
console.log(
  `✓  Generated ${rel(OUTPUT_PATH)} ` +
    `(${eligible.length} entr${eligible.length === 1 ? "y" : "ies"}, ` +
    `${withReadme.length} with README):`,
);
for (const f of eligible) {
  const readme = hasReadme(f) ? " [README]" : "";
  console.log(`     • ${rel(f)}${readme}`);
}
