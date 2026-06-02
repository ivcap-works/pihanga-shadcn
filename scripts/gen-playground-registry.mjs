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
 * Usage:
 *   node scripts/gen-playground-registry.mjs
 *   yarn gen-playground
 *   make gen-playground
 */

import {readdirSync, readFileSync, writeFileSync} from "node:fs";
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
// Step 4 — generate the output file
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

const importLines = eligible.map(
  (f) => `import ${toAlias(f)} from "${toImportPath(f)}";`,
);
const entryLines = eligible.map((f) => `  ${toAlias(f)},`);

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
// Last generated: ${new Date().toISOString()}
// ============================================================================
`;

const generated =
  banner +
  `
import type {PlaygroundDef} from "./playground.types";
${importLines.join("\n")}

/**
 * Static list of all playground definitions discovered at code-generation time.
 *
 * Unlike the dynamic \`registry.ts\` (populated at runtime via
 * \`registerPlaygroundDef()\`), this array is resolved at build time and is
 * therefore safe for static-site generation, bundle analysis, and tree-shaking.
 *
 * The playground engine can use either this list or the dynamic registry —
 * see \`src/playground/registry.ts\` for the runtime alternative.
 */
export const PLAYGROUND_EXAMPLES: PlaygroundDef[] = [
${entryLines.join("\n")}
];
`;

writeFileSync(OUTPUT_PATH, generated, "utf8");

const rel = (p) => relative(ROOT, p);
console.log(
  `✓  Generated ${rel(OUTPUT_PATH)} ` +
    `(${eligible.length} entr${eligible.length === 1 ? "y" : "ies"}):`,
);
for (const f of eligible) {
  console.log(`     • ${rel(f)}`);
}
