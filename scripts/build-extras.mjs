#!/usr/bin/env node
/**
 * scripts/build-extras.mjs
 *
 * Builds the "extra" card npm packages (heavy-dep cards excluded from the
 * core @pihanga2/shadcn package):
 *
 *   @pihanga2/shadcn-graphin   → dist-lib-graphin/
 *   @pihanga2/shadcn-chart     → dist-lib-chart/
 *   @pihanga2/shadcn-markdown  → dist-lib-markdown/
 *
 * Usage
 * -----
 *   node scripts/build-extras.mjs                     # build all extra packages
 *   node scripts/build-extras.mjs --pkg graphin        # build one package
 *   node scripts/build-extras.mjs --dry-run            # preview without writing
 *   yarn build:extras
 *   make build-extras
 */

import {readFileSync, writeFileSync, existsSync, mkdirSync} from "node:fs";
import {join, dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {execSync} from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ---------------------------------------------------------------------------
// Parse CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const pkgArgIdx = args.indexOf("--pkg");
const PKG_FILTER = pkgArgIdx !== -1 ? args[pkgArgIdx + 1] : null;

// ---------------------------------------------------------------------------
// Load config
// ---------------------------------------------------------------------------

const {packages} = JSON.parse(
  readFileSync(join(__dirname, "extra-packages.json"), "utf-8"),
);

const targets = PKG_FILTER
  ? packages.filter((p) => p.key === PKG_FILTER)
  : packages;

if (targets.length === 0) {
  const valid = packages.map((p) => p.key).join(", ");
  console.error(
    `❌  No package found for --pkg "${PKG_FILTER}". Valid keys: ${valid}`,
  );
  process.exit(1);
}

const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
const allVersions = {
  ...(rootPkg.dependencies ?? {}),
  ...(rootPkg.devDependencies ?? {}),
};

/**
 * These are always peer deps — never put in `dependencies`.
 */
const ALWAYS_PEER = new Set([
  "react",
  "react-dom",
  "@pihanga2/core",
  "@pihanga2/cards",
]);

/**
 * Shared runtime deps used by src/lib/utils.ts and src/components/ —
 * bundled into the output but their npm packages must be declared so
 * the consumer's bundler can resolve them.
 */
const SHARED_RUNTIME_DEPS = [
  "tailwind-merge",
  "clsx",
  "class-variance-authority",
];

// ---------------------------------------------------------------------------
// Build each target
// ---------------------------------------------------------------------------

for (const target of targets) {
  console.log(`\n${"═".repeat(62)}`);
  console.log(`📦  Building ${target.name}`);
  console.log("═".repeat(62));

  // ── Step 1: Vite build ────────────────────────────────────────────────

  console.log("\n🔨  Running Vite library build…");
  if (!DRY_RUN) {
    execSync(
      `PIHANGA_EXTRA_KEY=${target.key} npx vite build --config vite.extras.config.ts`,
      {cwd: ROOT, stdio: "inherit"},
    );
    console.log(`    ✓  Build complete → ${target.outDir}/`);
  } else {
    console.log("    (dry-run — skipped)");
  }

  // ── Step 2: Aggregate deps from each card's dependencies.json ─────────

  const collectedDeps = {};

  for (const card of target.cards) {
    const depsPath = join(ROOT, "src", "cards", card, "dependencies.json");
    if (!existsSync(depsPath)) continue;

    const {dependencies = {}} = JSON.parse(readFileSync(depsPath, "utf-8"));

    for (const [pkg, ver] of Object.entries(dependencies)) {
      if (ALWAYS_PEER.has(pkg)) continue;

      const resolvedVer = String(ver).includes("UNKNOWN")
        ? (allVersions[pkg] ?? ver)
        : ver;

      collectedDeps[pkg] = resolvedVer;
    }
  }

  // Add shared runtime deps (used by bundled src/lib/ and src/components/)
  for (const pkg of SHARED_RUNTIME_DEPS) {
    if (allVersions[pkg] && !collectedDeps[pkg]) {
      collectedDeps[pkg] = allVersions[pkg];
    }
  }

  const sortedDeps = Object.fromEntries(
    Object.entries(collectedDeps).sort(([a], [b]) => a.localeCompare(b)),
  );

  // ── Step 3: Build exports map ─────────────────────────────────────────

  const exportsMap = {};
  for (const card of target.cards) {
    exportsMap[`./cards/${card}`] = {
      import: `./cards/${card}/index.js`,
      types: `./cards/${card}/index.d.ts`,
    };
  }

  // ── Step 4: Write package.json ────────────────────────────────────────

  const publishPkg = {
    name: target.name,
    version: rootPkg.version,
    description: target.description,
    type: "module",
    exports: exportsMap,
    sideEffects: target.cards.map((c) => `./cards/${c}/index.js`),
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
      "cards",
      target.key,
    ],
    peerDependencies: {
      react: rootPkg.dependencies?.react ?? ">=19",
      "react-dom": rootPkg.dependencies?.["react-dom"] ?? ">=19",
      "@pihanga2/core": rootPkg.dependencies?.["@pihanga2/core"] ?? "*",
    },
    dependencies: sortedDeps,
  };

  const distDir = join(ROOT, target.outDir);
  const publishPkgStr = JSON.stringify(publishPkg, null, 2) + "\n";

  console.log(`\n📋  Writing ${target.outDir}/package.json…`);
  if (!DRY_RUN) {
    mkdirSync(distDir, {recursive: true});
    writeFileSync(join(distDir, "package.json"), publishPkgStr, "utf-8");
    console.log("    ✓  Written");
  } else {
    console.log("    (dry-run — would write:)");
    console.log(publishPkgStr);
  }

  // ── Step 5: Write README.md ───────────────────────────────────────────

  const readme = generateReadme(target, rootPkg, collectedDeps);

  console.log(`\n📄  Writing ${target.outDir}/README.md…`);
  if (!DRY_RUN) {
    writeFileSync(join(distDir, "README.md"), readme, "utf-8");
    console.log("    ✓  Written");
  } else {
    console.log("    (dry-run — not written)");
  }

  // ── Summary ───────────────────────────────────────────────────────────

  const dryTag = DRY_RUN ? "  (dry-run — files not written)" : "";
  console.log(`\n✅  ${target.name}@${rootPkg.version} complete${dryTag}`);
  console.log(`   Cards:      ${target.cards.join(", ")}`);
  console.log(`   Deps:       ${Object.keys(sortedDeps).length}`);
  console.log(`   Output dir: ${target.outDir}/`);
  if (!DRY_RUN) {
    console.log(
      `\n   Publish with:  cd ${target.outDir} && npm publish --access public\n`,
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateReadme(target, rootPkg, deps) {
  const depList = Object.entries(deps)
    .filter(([, v]) => v)
    .map(([k]) => `  - \`${k}\``)
    .join("\n");

  return `# ${target.name}

${target.description}

Part of the [pihanga-shadcn](https://github.com/ivcap-works/pihanga-shadcn) card library.

## Installation

\`\`\`sh
npm install ${target.name}
\`\`\`

Peer dependencies (already in your project if you use pihanga-shadcn):
\`\`\`sh
npm install react react-dom @pihanga2/core
\`\`\`

The following card-specific packages are installed automatically as dependencies:

${depList}

---

## Tailwind CSS

This package ships TypeScript source with Tailwind utility classes. Add it to
your Tailwind content scan so the classes are included in your generated CSS.

**Tailwind v4 (\`tailwind.css\`)**:
\`\`\`css
@source "../../node_modules/${target.name}/${target.outDir}";
\`\`\`

**Tailwind v3 (\`tailwind.config.js\`)**:
\`\`\`js
module.exports = {
  content: ["./node_modules/${target.name}/${target.outDir}/**/*.{js,jsx}"],
};
\`\`\`

---

## Usage

\`\`\`ts
${target.cards.map((c) => `import "${target.name}/cards/${c}";`).join("\n")}
\`\`\`

---

- Repository: <https://github.com/ivcap-works/pihanga-shadcn>
- shadcn registry: <https://ivcap-works.github.io/pihanga-shadcn/r>
`;
}
