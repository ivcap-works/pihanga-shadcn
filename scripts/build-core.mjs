#!/usr/bin/env node
/**
 * scripts/build-core.mjs
 *
 * Orchestrates the @pihanga2/shadcn npm package build:
 *
 *   1. Reads scripts/core-cards.json for the card allowlist.
 *   2. Runs `vite build --config vite.lib.config.ts`.
 *   3. Aggregates npm dependencies from each core card's dependencies.json.
 *   4. Writes dist-lib/package.json  (the publishable manifest).
 *   5. Writes dist-lib/README.md.
 *   6. Copies AGENT.*.md files into dist-lib/ for AI-assisted consumers.
 *
 * Usage
 * -----
 *   node scripts/build-core.mjs
 *   node scripts/build-core.mjs --dry-run   # skip vite build + writes
 *   yarn build:core
 *   make build-core
 */

import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import {join, dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {execSync} from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const coreConfig = JSON.parse(
  readFileSync(join(__dirname, "core-cards.json"), "utf-8"),
);
const CORE_CARDS = coreConfig.cards;

const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));

/** Use the per-package version from core-cards.json if set, else root package.json */
const PKG_VERSION = coreConfig.version ?? rootPkg.version;

const PKG_NAME = "@pihanga2/shadcn";
const DIST_DIR = join(ROOT, "dist-lib");

/**
 * These packages are always supplied by the consumer's app and must not appear
 * in `dependencies`.  They go into `peerDependencies` in the generated manifest.
 */
const ALWAYS_PEER = new Set([
  "react",
  "react-dom",
  "@pihanga2/core",
  "@pihanga2/cards",
]);

// ---------------------------------------------------------------------------
// Step 1 — Vite build
// ---------------------------------------------------------------------------

console.log("\n🔨  Running Vite library build…");
if (!DRY_RUN) {
  execSync("npx vite build --config vite.lib.config.ts", {
    cwd: ROOT,
    stdio: "inherit",
  });
  console.log("    ✓  Build complete  →  dist-lib/");
} else {
  console.log("    (dry-run — skipped)");
}

// ---------------------------------------------------------------------------
// Step 2 — Aggregate dependencies from core card dependencies.json files
// ---------------------------------------------------------------------------

const allVersions = {
  ...(rootPkg.dependencies ?? {}),
  ...(rootPkg.devDependencies ?? {}),
};

/**
 * Collected runtime dependencies for the generated package.json.
 * Key: npm package name.  Value: version range string.
 */
const collectedDeps = {};

for (const card of CORE_CARDS) {
  const depsPath = join(ROOT, "src", "cards", card, "dependencies.json");
  if (!existsSync(depsPath)) continue;

  const {dependencies = {}} = JSON.parse(readFileSync(depsPath, "utf-8"));

  for (const [pkg, ver] of Object.entries(dependencies)) {
    if (ALWAYS_PEER.has(pkg)) continue;

    // If the card's file says "UNKNOWN" fall back to root package.json version
    const resolvedVer = String(ver).includes("UNKNOWN")
      ? (allVersions[pkg] ?? ver)
      : ver;

    collectedDeps[pkg] = resolvedVer;
  }
}

// Include tailwind-merge + clsx (used by src/lib/utils.ts, shared by all cards)
for (const pkg of ["tailwind-merge", "clsx"]) {
  if (allVersions[pkg] && !collectedDeps[pkg]) {
    collectedDeps[pkg] = allVersions[pkg];
  }
}

// Sort for deterministic output
const sortedDeps = Object.fromEntries(
  Object.entries(collectedDeps).sort(([a], [b]) => a.localeCompare(b)),
);

// ---------------------------------------------------------------------------
// Step 3 — Build exports map
// ---------------------------------------------------------------------------

const exportsMap = {};

for (const card of CORE_CARDS) {
  exportsMap[`./cards/${card}`] = {
    import: `./cards/${card}/index.js`,
    types: `./cards/${card}/index.d.ts`,
  };
}

// Shared helper modules — always exported regardless of card allowlist
exportsMap["./cards/types"] = {
  import: "./cards/types.js",
  types: "./cards/types.d.ts",
};
exportsMap["./cards/icons"] = {
  import: "./cards/icons.js",
  types: "./cards/icons.d.ts",
};
exportsMap["./lib/utils"] = {
  import: "./lib/utils.js",
  types: "./lib/utils.d.ts",
};

// ---------------------------------------------------------------------------
// Step 4 — Write dist-lib/package.json
// ---------------------------------------------------------------------------

const publishPkg = {
  name: PKG_NAME,
  version: PKG_VERSION,
  description:
    "Pihanga core card components built on shadcn/ui and Radix UI — " +
    "the npm distribution of pihanga-shadcn.",
  type: "module",
  exports: exportsMap,
  /**
   * Only card index files are side-effectful (they call registerCardComponent).
   * Shared primitive files (lib/utils, hooks, …) are pure and can be tree-shaken.
   */
  sideEffects: CORE_CARDS.map((c) => `./cards/${c}/index.js`),
  license: rootPkg.license ?? "MIT",
  homepage: "https://ivcap-works.github.io/pihanga-shadcn",
  repository: rootPkg.repository ?? {
    type: "git",
    url: "https://github.com/ivcap-works/pihanga-shadcn.git",
  },
  keywords: [
    "pihanga",
    "shadcn",
    "radix-ui",
    "react",
    "ui",
    "components",
    "cards",
  ],
  peerDependencies: {
    react: rootPkg.dependencies?.react ?? ">=19",
    "react-dom": rootPkg.dependencies?.["react-dom"] ?? ">=19",
    "@pihanga2/core": rootPkg.dependencies?.["@pihanga2/core"] ?? "*",
    "@pihanga2/cards": rootPkg.dependencies?.["@pihanga2/cards"] ?? "*",
  },
  dependencies: sortedDeps,
};

const publishPkgStr = JSON.stringify(publishPkg, null, 2) + "\n";

console.log("\n📦  Writing dist-lib/package.json…");
if (!DRY_RUN) {
  mkdirSync(DIST_DIR, {recursive: true});
  writeFileSync(join(DIST_DIR, "package.json"), publishPkgStr, "utf-8");
  console.log("    ✓  Written");
} else {
  console.log("    (dry-run — would write:)");
  console.log(publishPkgStr);
}

// ---------------------------------------------------------------------------
// Step 5 — Write dist-lib/README.md
// ---------------------------------------------------------------------------

const readme = `# ${PKG_NAME}

Pihanga core card components — built on [shadcn/ui](https://ui.shadcn.com) and
[Radix UI](https://radix-ui.com).

This is the traditional **npm package** distribution of the
[pihanga-shadcn](https://github.com/ivcap-works/pihanga-shadcn) card library.

A **copy-on-install shadcn registry** is also available for teams that prefer
the shadcn workflow:
\`\`\`sh
npx shadcn@latest add https://ivcap-works.github.io/pihanga-shadcn/r/button
\`\`\`

---

## Installation

\`\`\`sh
npm install ${PKG_NAME}
\`\`\`

Install the required peer dependencies:
\`\`\`sh
npm install react react-dom @pihanga2/core @pihanga2/cards
\`\`\`

---

## Tailwind CSS

This package ships TypeScript source with Tailwind CSS utility classes.  Add
the package to your Tailwind content glob so that utility classes are included
in your generated CSS.

**Tailwind v3** (\`tailwind.config.js\`):
\`\`\`js
module.exports = {
  content: [
    // … your project files …
    "./node_modules/${PKG_NAME}/dist-lib/**/*.{js,jsx,ts,tsx}",
  ],
};
\`\`\`

**Tailwind v4** (\`tailwind.css\`):
\`\`\`css
@source "../../node_modules/${PKG_NAME}/dist-lib";
\`\`\`

---

## Usage

Import only the cards your app uses — unused cards are eliminated by your bundler:

\`\`\`ts
import "${PKG_NAME}/cards/button";
import "${PKG_NAME}/cards/dialog";
import "${PKG_NAME}/cards/dataTable";
\`\`\`

---

## Included cards (${CORE_CARDS.length})

${CORE_CARDS.map((c) => `- \`${c}\``).join("\n")}

---

## Source & registry

- Repository: <https://github.com/ivcap-works/pihanga-shadcn>
- shadcn registry: <https://ivcap-works.github.io/pihanga-shadcn/r>
`;

console.log("\n📄  Writing dist-lib/README.md…");
if (!DRY_RUN) {
  writeFileSync(join(DIST_DIR, "README.md"), readme, "utf-8");
  console.log("    ✓  Written");
} else {
  console.log("    (dry-run — not written)");
}

// ---------------------------------------------------------------------------
// Step 6 — Copy AGENT.*.md files for AI-assisted consumers
// ---------------------------------------------------------------------------

const AGENT_FILES = [
  "AGENT.md",
  "AGENT.building-cards.md",
  "AGENT.using-cards.md",
];

console.log("\n🤖  Copying AGENT.*.md files…");
if (!DRY_RUN) {
  mkdirSync(DIST_DIR, {recursive: true});
  for (const file of AGENT_FILES) {
    const src = join(ROOT, file);
    if (existsSync(src)) {
      copyFileSync(src, join(DIST_DIR, file));
      console.log(`    ✓  ${file}`);
    } else {
      console.warn(`    ⚠  ${file} not found — skipped`);
    }
  }
} else {
  console.log(`    (dry-run — would copy: ${AGENT_FILES.join(", ")})`);
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const dryTag = DRY_RUN ? "  (dry-run — files not written)" : "";
console.log(`\n✅  ${PKG_NAME}@${PKG_VERSION} build complete${dryTag}`);
console.log(`   Cards:        ${CORE_CARDS.length}`);
console.log(`   Dependencies: ${Object.keys(sortedDeps).length}`);
console.log(`   Output dir:   dist-lib/`);
if (!DRY_RUN) {
  console.log(
    `\n   Publish with:  cd dist-lib && npm publish --access public\n`,
  );
}
