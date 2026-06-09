#!/usr/bin/env node
/**
 * scripts/gen-registry.mjs
 *
 * Generates a shadcn-compatible distribution registry in public/r/
 *
 * Each card under src/cards/ gets a JSON file at public/r/<card>.json.
 * Shared primitives (UI wrappers, lib utils, hooks, theme-provider) get their
 * own entries.  A top-level public/r/registry.json manifest is also emitted.
 *
 * The generated JSON can be served as-is by GitHub Pages (the dist/ folder
 * already includes public/) or accessed directly via raw.githubusercontent.com.
 *
 * Usage
 * -----
 *   node scripts/gen-registry.mjs
 *   node scripts/gen-registry.mjs --base-url https://ivcap-works.github.io/pihanga-shadcn
 *   node scripts/gen-registry.mjs --base-url http://localhost:5173   # local testing
 *   yarn gen-registry
 *   make gen-registry
 *
 * Options
 * -------
 *   --base-url <url>   Base URL where public/ is hosted (no trailing slash).
 *                      Default: https://ivcap-works.github.io/pihanga-shadcn
 *   --dry-run          Print what would be generated without writing any files.
 */

import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  statSync,
} from "node:fs";
import {join, dirname, basename} from "node:path";
import {fileURLToPath} from "node:url";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CARDS_DIR = join(ROOT, "src", "cards");
const COMPONENTS_DIR = join(ROOT, "src", "components");
const LIB_DIR = join(ROOT, "src", "lib");
const OUTPUT_DIR = join(ROOT, "public", "r");

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const baseUrlIdx = args.indexOf("--base-url");
const BASE_URL =
  baseUrlIdx !== -1
    ? args[baseUrlIdx + 1].replace(/\/$/, "")
    : "https://ivcap-works.github.io/pihanga-shadcn";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** npm packages always provided by the consumer's app — excluded from deps */
const ALWAYS_PROVIDED = new Set(["react", "react-dom", "@pihanga2/core"]);

/** Files never included in a card's registry entry */
const EXCLUDE_PATTERNS = [
  /\.example\.(ts|tsx)$/,
  /\.test\.(ts|tsx)$/,
  /^dependencies\.json$/,
  /HOWTO/i,
  /README/i,
  /\.d\.ts$/,
];

/**
 * UI components that exist in the official shadcn/ui registry.
 * The shadcn CLI resolves plain names (without URL) against the official registry
 * at https://ui.shadcn.com/r/<name>.json, so these do NOT need our own entries.
 *
 * Key: filename without extension (as found in src/components/ui/)
 * Value: the official shadcn registry name for the `npx shadcn add <name>` command
 */
const OFFICIAL_SHADCN_UI = new Map([
  ["avatar", "avatar"],
  ["badge", "badge"],
  ["calendar", "calendar"],
  ["card", "card"],
  ["context-menu", "context-menu"],
  // "dialog" is intentionally excluded — pihanga-shadcn ships a customised
  // dialog.tsx that adds DialogBody, size/dismissible/hideClose/fixed props,
  // etc.  It is bundled in pihanga-ui-extras instead.
  ["drawer", "drawer"],
  ["dropdown-menu", "dropdown-menu"],
  ["input", "input"],
  ["label", "label"],
  ["menubar", "menubar"],
  ["resizable", "resizable"],
  ["select", "select"],
  ["separator", "separator"],
  ["sheet", "sheet"],
  ["switch", "switch"],
  ["table", "table"],
  ["tabs", "tabs"],
  ["textarea", "textarea"],
  ["toggle", "toggle"],
  ["toggle-group", "toggle-group"],
  ["tooltip", "tooltip"],
]);

/**
 * UI files that are NOT in the official shadcn registry — either fully custom
 * or customised beyond the standard shadcn version.  These are bundled into
 * the `pihanga-ui-extras` registry entry.
 *
 * button.tsx    — adds LinkButton export (not in standard shadcn button)
 * dialog.tsx    — extends shadcn dialog with DialogBody, size/dismissible/
 *                 hideClose/fixed props; NOT the standard shadcn dialog
 * *-variants.ts — Pihanga-specific variant tables
 * field.tsx     — custom Pihanga field primitive
 * spinner.tsx   — not in shadcn
 * stepper.tsx   — not in shadcn
 * toolbar.tsx   — wraps @radix-ui/react-toolbar (not in shadcn v4)
 */
const PIHANGA_CUSTOM_UI = new Set([
  "button.tsx",
  "button-variants.ts",
  "badge-variants.ts",
  "dialog.tsx",
  "editor-static-variants.ts",
  "field.tsx",
  "spinner.tsx",
  "stepper.tsx",
  "toolbar.tsx",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Full URL for a registry item name */
function itemUrl(name) {
  return `${BASE_URL}/r/${name}.json`;
}

/** Read root package.json once for version lookups */
const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
const allVersions = {
  ...(rootPkg.dependencies ?? {}),
  ...(rootPkg.devDependencies ?? {}),
};

/** Return "pkg@version" if version known, else just "pkg" */
function fmtDep(pkg, version) {
  const ver = version ?? allVersions[pkg];
  return ver ? `${pkg}@${ver}` : pkg;
}

/** Whether a filename should be included in the registry */
function shouldInclude(filename) {
  return !EXCLUDE_PATTERNS.some((p) => p.test(filename));
}

/**
 * Extract bare npm package names from `import … from "…"` statements.
 * Skips relative imports and @/ alias imports.
 */
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

/**
 * Extract all @/ alias import specifiers from source content.
 */
function extractAliasImports(content) {
  const specs = new Set();
  const re = /from\s+['"](@\/[^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) specs.add(m[1]);
  return specs;
}

/**
 * Rewrite source content for distribution:
 *   @/registry/* → @/components/*
 * (vite.config.ts maps @/registry → src/components; consumers won't have
 * that alias, so we normalise to the canonical @/components/ form.)
 */
function transformContent(content) {
  return content.replace(/@\/registry\//g, "@/components/");
}

/**
 * Derive the list of registry item URLs that a set of source files requires.
 *
 * @param {Array<{content:string}>} fileContents  Transformed file contents
 * @param {string} selfName                        Name of the item being built
 *                                                 (to avoid self-references)
 * @param {boolean} isSharedPrimitive              When true, skip pihanga-base
 *                                                 (only card-level entries need it)
 */
function computeRegistryDeps(
  fileContents,
  selfName,
  isSharedPrimitive = false,
) {
  const deps = new Set();

  // Every card-level entry depends on the Pihanga runtime
  if (!isSharedPrimitive) {
    deps.add(itemUrl("pihanga-base"));
  }

  for (const {content} of fileContents) {
    for (const spec of extractAliasImports(content)) {
      if (spec === "@/lib/utils" || spec.startsWith("@/lib/")) {
        // @/lib/utils → pihanga-lib-utils
        if (selfName !== "pihanga-lib-utils") {
          deps.add(itemUrl("pihanga-lib-utils"));
        }
      } else if (
        spec.startsWith("@/registry/ui/") ||
        spec.startsWith("@/components/ui/")
      ) {
        // e.g. @/components/ui/button  →  uiName = "button"
        const uiName = spec.split("/").pop();
        // Remove extension if present (e.g. from a direct .tsx import)
        const uiBase = uiName.replace(/\.(ts|tsx)$/, "");

        if (OFFICIAL_SHADCN_UI.has(uiBase)) {
          // Standard shadcn component — reference official registry by plain name.
          // The shadcn CLI resolves plain names against https://ui.shadcn.com/r/<name>.json
          const shadcnName = OFFICIAL_SHADCN_UI.get(uiBase);
          deps.add(shadcnName);
        } else {
          // Custom / Pihanga-extended component — use our pihanga-ui-extras bundle
          if (selfName !== "pihanga-ui-extras") {
            deps.add(itemUrl("pihanga-ui-extras"));
          }
        }
      } else if (
        spec.startsWith("@/components/theme-provider") ||
        spec.startsWith("@/registry/theme-provider")
      ) {
        if (selfName !== "pihanga-theme-provider") {
          deps.add(itemUrl("pihanga-theme-provider"));
        }
      } else if (
        spec.startsWith("@/components/hooks/") ||
        spec.startsWith("@/hooks/")
      ) {
        const hookFile = spec.split("/").pop();
        const hookName = hookFile.replace(/\.(ts|tsx)$/, "");
        const depName = `pihanga-hook-${hookName}`;
        if (depName !== selfName) deps.add(itemUrl(depName));
      } else if (
        spec === "@/cards/icons" ||
        spec.startsWith("@/cards/icons/")
      ) {
        if (selfName !== "pihanga-cards-icons") {
          deps.add(itemUrl("pihanga-cards-icons"));
        }
      } else if (
        spec === "@/cards/types" ||
        spec.startsWith("@/cards/types/")
      ) {
        if (selfName !== "pihanga-cards-types") {
          deps.add(itemUrl("pihanga-cards-types"));
        }
      } else if (spec.startsWith("@/cards/")) {
        // Cross-card dependency: @/cards/<depCard>/...
        const parts = spec.split("/");
        const depCard = parts[2]; // e.g. "dropDownMenu"
        if (depCard && depCard !== selfName) {
          deps.add(itemUrl(depCard));
        }
      }
    }
  }

  return [...deps];
}

// ---------------------------------------------------------------------------
// Item generators
// ---------------------------------------------------------------------------

/**
 * pihanga-base — meta entry; no files; installs @pihanga2/core automatically.
 */
function genPihangaBase() {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "pihanga-base",
    type: "registry:component",
    description:
      "Pihanga core runtime dependency — no source files; " +
      "installing it triggers automatic `npm install @pihanga2/core`.",
    dependencies: ["@pihanga2/core"],
    registryDependencies: [],
    files: [],
  };
}

/**
 * pihanga-lib-utils — the shared cn() utility (src/lib/utils.ts).
 */
function genLibUtils() {
  const content = readFileSync(join(LIB_DIR, "utils.ts"), "utf-8");
  const npmDeps = [...extractNpmImports(content)].map((p) => fmtDep(p));
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "pihanga-lib-utils",
    type: "registry:lib",
    description: "Tailwind CSS utility helper — the cn() function",
    dependencies: npmDeps,
    registryDependencies: [],
    files: [{path: "lib/utils.ts", content, type: "registry:lib"}],
  };
}

/**
 * pihanga-cards-icons — src/cards/icons.ts (icon registry utilities).
 */
function genCardsIcons() {
  const raw = readFileSync(join(CARDS_DIR, "icons.ts"), "utf-8");
  const content = transformContent(raw);
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "pihanga-cards-icons",
    type: "registry:component",
    description: "Pihanga icon registry — registerIcon / getIcon helpers",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "cards/icons.ts",
        content,
        type: "registry:component",
        target: "src/cards/icons.ts",
      },
    ],
  };
}

/**
 * pihanga-cards-types — src/cards/types.ts (shared ScreenSize, VariantT, …).
 */
function genCardsTypes() {
  const content = readFileSync(join(CARDS_DIR, "types.ts"), "utf-8");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "pihanga-cards-types",
    type: "registry:component",
    description:
      "Shared Pihanga card type definitions (ScreenSize, VariantT, SizeT, …)",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "cards/types.ts",
        content,
        type: "registry:component",
        target: "src/cards/types.ts",
      },
    ],
  };
}

/**
 * pihanga-theme-provider — src/components/theme-provider/*.
 */
function genThemeProvider() {
  const providerDir = join(COMPONENTS_DIR, "theme-provider");
  const files = [];
  const contents = [];

  for (const entry of readdirSync(providerDir, {withFileTypes: true})) {
    if (!entry.isFile()) continue;
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    const raw = readFileSync(join(providerDir, entry.name), "utf-8");
    const content = transformContent(raw);
    contents.push({content});
    files.push({
      path: `components/theme-provider/${entry.name}`,
      content,
      type: "registry:component",
    });
  }

  const regDeps = computeRegistryDeps(contents, "pihanga-theme-provider", true);

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "pihanga-theme-provider",
    type: "registry:component",
    description: "Pihanga theme provider — light / dark mode support",
    dependencies: [],
    registryDependencies: regDeps,
    files,
  };
}

/**
 * pihanga-hook-<name> — one entry per file in src/components/hooks/.
 */
function genHooks() {
  const hooksDir = join(COMPONENTS_DIR, "hooks");
  if (!existsSync(hooksDir)) return [];

  return readdirSync(hooksDir, {withFileTypes: true})
    .filter((e) => e.isFile() && /\.(ts|tsx)$/.test(e.name))
    .map((entry) => {
      const nameWithoutExt = entry.name.replace(/\.(ts|tsx)$/, "");
      const raw = readFileSync(join(hooksDir, entry.name), "utf-8");
      const content = transformContent(raw);
      const npmDeps = [...extractNpmImports(content)].map((p) => fmtDep(p));
      const name = `pihanga-hook-${nameWithoutExt}`;
      return {
        name,
        json: {
          $schema: "https://ui.shadcn.com/schema/registry-item.json",
          name,
          type: "registry:hook",
          description: `Pihanga shared hook: ${nameWithoutExt}`,
          dependencies: npmDeps,
          registryDependencies: [],
          files: [
            {
              path: `hooks/${entry.name}`,
              content,
              type: "registry:hook",
            },
          ],
        },
      };
    });
}

/**
 * pihanga-ui-extras — bundles all src/components/ui/ files that are NOT in the
 * official shadcn/ui registry (custom components or shadcn files we've
 * extended beyond their standard form).
 *
 * Standard shadcn components (tooltip, dialog, etc.) are referenced via their
 * plain shadcn names in registryDependencies and fetched by the CLI from the
 * official registry — no separate entries needed for them.
 */
function genUIExtras() {
  const uiDir = join(COMPONENTS_DIR, "ui");
  const files = [];
  const contents = [];
  const allNpmDeps = new Set();

  for (const entry of readdirSync(uiDir, {withFileTypes: true}).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (!entry.isFile()) continue;
    if (!PIHANGA_CUSTOM_UI.has(entry.name)) continue;

    const raw = readFileSync(join(uiDir, entry.name), "utf-8");
    const content = transformContent(raw);
    contents.push({content});

    for (const pkg of extractNpmImports(content)) {
      if (!ALWAYS_PROVIDED.has(pkg)) allNpmDeps.add(pkg);
    }

    files.push({
      path: `components/ui/${entry.name}`,
      content,
      type: "registry:ui",
    });
  }

  const npmDeps = [...allNpmDeps].map((p) => fmtDep(p));
  const regDeps = computeRegistryDeps(contents, "pihanga-ui-extras", true);

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "pihanga-ui-extras",
    type: "registry:ui",
    description:
      "Pihanga-custom UI primitives not available in the official shadcn/ui registry " +
      "(button with LinkButton, customised dialog with DialogBody, spinner, field, stepper, toolbar, variant tables).",
    dependencies: npmDeps,
    registryDependencies: regDeps,
    files,
  };
}

/**
 * <card-name> — one entry per subdirectory of src/cards/.
 *
 * Includes every .ts / .tsx / .css file except examples, tests, and
 * dependencies.json.  File content is transformed (@/registry/ → @/components/).
 * Files are placed at src/cards/<card>/<file> in the consumer's project via
 * the `target` field.
 */
function genCard(cardDir) {
  const cardName = basename(cardDir);

  // Read dependencies.json for npm deps
  const depsJsonPath = join(cardDir, "dependencies.json");
  const depsJson = existsSync(depsJsonPath)
    ? JSON.parse(readFileSync(depsJsonPath, "utf-8"))
    : {dependencies: {}, devDependencies: {}};

  // Collect source files
  let dirEntries;
  try {
    dirEntries = readdirSync(cardDir, {withFileTypes: true});
  } catch {
    return null;
  }

  const fileInfos = [];
  for (const entry of dirEntries) {
    if (!entry.isFile()) continue;
    if (!shouldInclude(entry.name)) continue;
    if (!/\.(ts|tsx|css)$/.test(entry.name)) continue;

    const raw = readFileSync(join(cardDir, entry.name), "utf-8");
    const content = transformContent(raw);
    fileInfos.push({name: entry.name, content});
  }

  if (fileInfos.length === 0) return null;

  // npm deps from dependencies.json (authoritative source)
  const npmDeps = Object.entries(depsJson.dependencies ?? {}).map(
    ([pkg, ver]) => fmtDep(pkg, ver),
  );

  // registry deps computed from source imports
  const regDeps = computeRegistryDeps(
    fileInfos.map((f) => ({content: f.content})),
    cardName,
    false,
  );

  const files = fileInfos.map((f) => ({
    path: `cards/${cardName}/${f.name}`,
    content: f.content,
    type: "registry:component",
    target: `src/cards/${cardName}/${f.name}`,
  }));

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: cardName,
    type: "registry:component",
    description: `Pihanga ${cardName} card component`,
    dependencies: npmDeps,
    registryDependencies: regDeps,
    files,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

if (!DRY_RUN) mkdirSync(OUTPUT_DIR, {recursive: true});

const allItems = [];
let totalFiles = 0;
let errorCount = 0;

function write(name, json) {
  const jsonStr = JSON.stringify(json, null, 2) + "\n";
  if (!DRY_RUN) {
    writeFileSync(join(OUTPUT_DIR, `${name}.json`), jsonStr);
  }
  totalFiles++;
}

function track(name, type) {
  allItems.push({name, type});
}

// --- Shared primitives -------------------------------------------------------

try {
  write("pihanga-base", genPihangaBase());
  track("pihanga-base", "registry:component");
  console.log("  ✓  pihanga-base");
} catch (e) {
  console.error(`  ✗  pihanga-base: ${e.message}`);
  errorCount++;
}

try {
  write("pihanga-lib-utils", genLibUtils());
  track("pihanga-lib-utils", "registry:lib");
  console.log("  ✓  pihanga-lib-utils");
} catch (e) {
  console.error(`  ✗  pihanga-lib-utils: ${e.message}`);
  errorCount++;
}

try {
  write("pihanga-cards-icons", genCardsIcons());
  track("pihanga-cards-icons", "registry:component");
  console.log("  ✓  pihanga-cards-icons");
} catch (e) {
  console.error(`  ✗  pihanga-cards-icons: ${e.message}`);
  errorCount++;
}

try {
  write("pihanga-cards-types", genCardsTypes());
  track("pihanga-cards-types", "registry:component");
  console.log("  ✓  pihanga-cards-types");
} catch (e) {
  console.error(`  ✗  pihanga-cards-types: ${e.message}`);
  errorCount++;
}

try {
  write("pihanga-theme-provider", genThemeProvider());
  track("pihanga-theme-provider", "registry:component");
  console.log("  ✓  pihanga-theme-provider");
} catch (e) {
  console.error(`  ✗  pihanga-theme-provider: ${e.message}`);
  errorCount++;
}

// --- Hooks -------------------------------------------------------------------

for (const {name, json} of genHooks()) {
  try {
    write(name, json);
    track(name, "registry:hook");
    console.log(`  ✓  ${name}`);
  } catch (e) {
    console.error(`  ✗  ${name}: ${e.message}`);
    errorCount++;
  }
}

// --- UI extras (custom / extended shadcn primitives) -------------------------

try {
  const uiExtras = genUIExtras();
  write("pihanga-ui-extras", uiExtras);
  track("pihanga-ui-extras", "registry:ui");
  console.log(
    `  ✓  pihanga-ui-extras  (${uiExtras.files.length} custom UI files)`,
  );
} catch (e) {
  console.error(`  ✗  pihanga-ui-extras: ${e.message}`);
  errorCount++;
}

// --- Cards -------------------------------------------------------------------

let cardCount = 0;
for (const entry of readdirSync(CARDS_DIR).sort()) {
  const cardDir = join(CARDS_DIR, entry);
  try {
    if (!statSync(cardDir).isDirectory()) continue;
  } catch {
    continue;
  }

  try {
    const card = genCard(cardDir);
    if (!card) continue;
    write(entry, card);
    track(entry, "registry:component");
    console.log(`  ✓  card/${entry}`);
    cardCount++;
  } catch (e) {
    console.error(`  ✗  card/${entry}: ${e.message}`);
    errorCount++;
  }
}

// --- registry.json index -----------------------------------------------------

const registryIndex = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "pihanga-shadcn",
  homepage: "https://ivcap-works.github.io/pihanga-shadcn",
  items: allItems,
};
write("registry", registryIndex);

// --- Summary -----------------------------------------------------------------

const dryTag = DRY_RUN ? "  (dry-run — no files written)" : "";
console.log("");
console.log(`✓  Generated ${totalFiles} registry files${dryTag}`);
console.log(`   Cards:          ${cardCount}`);
console.log(
  `   Shared:         6  (pihanga-base, lib-utils, ui-extras, cards-icons, cards-types, theme-provider)`,
);
console.log(`   Note: standard shadcn UI components (tooltip, dialog, etc.)`);
console.log(
  `         are referenced by plain name from the official shadcn registry.`,
);
if (errorCount > 0) {
  console.log(`   Errors:         ${errorCount}`);
}
console.log("");
console.log(`   Base URL:    ${BASE_URL}`);
console.log(`   Output dir:  public/r/`);
console.log("");
console.log("   Consumer install example:");
console.log(`     npx shadcn@latest add ${BASE_URL}/r/button`);
