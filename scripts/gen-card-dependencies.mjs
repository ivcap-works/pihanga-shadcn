#!/usr/bin/env node
/**
 * scripts/gen-card-dependencies.mjs
 *
 * For every card directory under src/cards/, analyses all .ts/.tsx source
 * files and writes (or updates) a `dependencies.json` listing required npm
 * packages.
 *
 * STRATEGY
 * --------
 * 1. Collect every .ts/.tsx file directly inside the card folder (tests skipped).
 * 2. Extract:
 *    a) Direct npm imports - not relative, not "@/" aliases.
 *    b) @/components/ui/*, @/registry/ui/*, @/components/theme-provider/* -
 *       these aliases resolve via vite.config.ts to src/components/.
 *       We read those resolved files and capture their npm imports too.
 * 3. Look up versions from root package.json.
 *    devDependencies in root -> devDependencies in card; rest -> dependencies.
 * 4. Always-provided packages (react, react-dom, @pihanga2/core) are excluded.
 *
 * USAGE
 * -----
 *   node scripts/gen-card-dependencies.mjs            # write all cards
 *   node scripts/gen-card-dependencies.mjs --dry-run  # preview only
 *   node scripts/gen-card-dependencies.mjs --card select
 *
 * ALIAS RULES (vite.config.ts)
 * ----------------------------
 *   @/registry -> src/components   (so @/registry/ui/* == @/components/ui/*)
 *   @          -> src
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const ALWAYS_PROVIDED = new Set(["react", "react-dom", "@pihanga2/core"]);

const TRACEABLE_PREFIXES = [
  "@/components/ui/",
  "@/registry/ui/",
  "@/components/theme-provider",
];

// CLI flags
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const CARD_FILTER = (() => {
  const idx = args.indexOf("--card");
  return idx !== -1 ? args[idx + 1] : null;
})();

// Root package.json
const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf-8"));
const rootDeps = rootPkg.dependencies ?? {};
const rootDevDeps = rootPkg.devDependencies ?? {};
const allVersions = { ...rootDeps, ...rootDevDeps };

function extractNpmImports(content) {
  const pkgs = new Set();
  const re = /from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const spec = m[1];
    if (spec.startsWith(".") || spec.startsWith("@/")) continue;
    const pkgName = spec.startsWith("@")
      ? spec.split("/").slice(0, 2).join("/")
      : spec.split("/")[0];
    if (!ALWAYS_PROVIDED.has(pkgName)) pkgs.add(pkgName);
  }
  return pkgs;
}

function extractAliasImports(content) {
  const specs = new Set();
  const re = /from\s+['"](@\/[^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) specs.add(m[1]);
  return specs;
}

function resolveAlias(spec) {
  const base = spec.startsWith("@/registry/")
    ? path.join(ROOT, "src", "components", spec.slice("@/registry/".length))
    : path.join(ROOT, "src", spec.slice(2));
  for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts", ""]) {
    const candidate = base + ext;
    try { if (fs.statSync(candidate).isFile()) return candidate; } catch {}
  }
  return null;
}

function processCard(cardDir) {
  const cardName = path.basename(cardDir);
  const sourceFiles = fs.readdirSync(cardDir)
    .filter((f) => /\.(ts|tsx)$/.test(f) && !/\.test\.(ts|tsx)$/.test(f))
    .map((f) => path.join(cardDir, f));
  if (sourceFiles.length === 0) return null;

  const allPkgs = new Set();
  const warnings = [];

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, "utf-8");
    for (const pkg of extractNpmImports(content)) allPkgs.add(pkg);
    for (const spec of extractAliasImports(content)) {
      if (!TRACEABLE_PREFIXES.some((p) => spec.startsWith(p))) continue;
      const resolved = resolveAlias(spec);
      if (!resolved) {
        warnings.push(`  WARN [${cardName}] cannot resolve ${spec} in ${path.basename(file)}`);
        continue;
      }
      const inner = fs.readFileSync(resolved, "utf-8");
      for (const pkg of extractNpmImports(inner)) allPkgs.add(pkg);
    }
  }

  const deps = {};
  const devDeps = {};
  for (const pkg of [...allPkgs].sort()) {
    const version = allVersions[pkg] ?? "UNKNOWN - add to root package.json";
    if (rootDevDeps[pkg]) {
      devDeps[pkg] = version;
    } else {
      deps[pkg] = version;
    }
  }

  // Preserve manually-added entries not detected by scanner
  const existingPath = path.join(cardDir, "dependencies.json");
  if (fs.existsSync(existingPath)) {
    let existing;
    try { existing = JSON.parse(fs.readFileSync(existingPath, "utf-8")); } catch { existing = {}; }
    for (const [pkg, ver] of Object.entries(existing.dependencies ?? {})) {
      if (!deps[pkg] && !devDeps[pkg]) {
        warnings.push(`  WARN [${cardName}] "${pkg}" in existing file but not detected - keeping`);
        deps[pkg] = ver;
      }
    }
    for (const [pkg, ver] of Object.entries(existing.devDependencies ?? {})) {
      if (!deps[pkg] && !devDeps[pkg]) {
        warnings.push(`  WARN [${cardName}] "${pkg}" in existing devDeps but not detected - keeping`);
        devDeps[pkg] = ver;
      }
    }
  }

  return { deps, devDeps, warnings };
}

// Main
const cardsDir = path.join(ROOT, "src", "cards");
let created = 0, updated = 0, unchanged = 0;
const allWarnings = [];

for (const entry of fs.readdirSync(cardsDir).sort()) {
  const cardDir = path.join(cardsDir, entry);
  if (!fs.statSync(cardDir).isDirectory()) continue;
  if (CARD_FILTER && entry !== CARD_FILTER) continue;

  const result = processCard(cardDir);
  if (!result) continue;

  const { deps, devDeps, warnings } = result;
  allWarnings.push(...warnings);

  const output = { dependencies: deps, devDependencies: devDeps };
  const newContent = JSON.stringify(output, null, 2) + "\n";
  const outPath = path.join(cardDir, "dependencies.json");

  if (fs.existsSync(outPath)) {
    const existing = fs.readFileSync(outPath, "utf-8");
    if (existing === newContent) {
      console.log(`  [unchanged] ${entry}`);
      unchanged++;
    } else {
      console.log(`  [updated]   ${entry}`);
      if (!DRY_RUN) fs.writeFileSync(outPath, newContent, "utf-8");
      updated++;
    }
  } else {
    console.log(`  [created]   ${entry}`);
    if (!DRY_RUN) fs.writeFileSync(outPath, newContent, "utf-8");
    created++;
  }
}

if (allWarnings.length > 0) {
  console.log("\nWarnings:");
  allWarnings.forEach((w) => console.log(w));
}
console.log(
  `\nDone: ${created} created, ${updated} updated, ${unchanged} unchanged` +
  (DRY_RUN ? "  (dry-run - no files written)" : "") + "."
);
