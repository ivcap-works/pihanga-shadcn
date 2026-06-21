# Publishing `pihanga-shadcn` Cards as an NPM Package

## Background & Context

This repository is currently a **Vite playground app** (`"private": true`) used to develop and demo
Pihanga cards built on top of shadcn/Radix UI. The goal is to publish the cards (and the shared
`src/components/` wrappers they depend on) as a re-usable NPM package, without shipping the
playground scaffolding.

### What would be published

| Source | Publish? | Notes |
|---|---|---|
| `src/cards/*/index.ts` + component/types files | ✅ Yes | Core deliverable |
| `src/components/ui/*.tsx` | ✅ Yes | shadcn wrappers used by cards |
| `src/components/hooks/` | ✅ Yes | Shared hooks |
| `src/components/lib/` | ✅ Yes | Shared utilities (`cn`, etc.) |
| `src/components/theme-provider/` | ✅ Yes | Theme support |
| `src/cards/*/dependencies.json` | ✅ Yes | Tooling metadata |
| `src/cards/*/*.example.ts` | ⚠️  Optional | Useful as docs; no runtime cost |
| `src/playground/` | ❌ No | Playground-only |
| `src/app.*` | ❌ No | App shell, playground only |
| `src/main.ts`, `index.html` | ❌ No | Vite entry point |

### Key constraints

- **Tailwind CSS v4** — cards use Tailwind utility classes in JSX; downstream consumers must have
  Tailwind configured and pointing at the package's source (or the package must ship pre-built CSS).
- **Path alias `@/`** — all cards import shared components via `@/components/ui/…`, `@/lib/…`; this
  alias must be resolved before distribution.
- **Peer dependencies** — `react`, `react-dom`, `@pihanga2/core`, and Tailwind should be peer deps
  (not bundled).
- **Side-effect imports** — each card's `index.ts` calls `registerCardComponent(...)` at import time
  (side-effecting), which means tree-shaking at the *card* level requires consumers to individually
  import only the cards they want.

---

## Option A — Single NPM Package (Vite Library Mode)

### What it is

Build the entire `src/cards/` + `src/components/` tree once with **Vite's `lib` mode**, producing
ES-module and optionally CommonJS bundles. Publish as a single package, e.g.
`@pihanga2/shadcn-cards`.

### How it works

1. Add a `vite.lib.config.ts` (separate from the playground config) with:
   ```ts
   build: {
     lib: {
       entry: "src/cards/index.ts",   // barrel that re-exports every card
       formats: ["es"],
       fileName: "index",
     },
     rollupOptions: {
       external: ["react", "react-dom", "@pihanga2/core", ...radixPackages],
       preserveEntrySignatures: "exports-only",
     },
   }
   ```
2. Resolve `@/` aliases to relative paths *before* bundling (Vite does this automatically).
3. Run `tsc --emitDeclarationOnly` (or `vite-plugin-dts`) to emit `.d.ts` files.
4. Ship generated `dist/` plus a `package.json` that sets `"exports"`, `"types"`, `"peerDependencies"`.
5. Add `"sideEffects": false` (or list only card index files) so bundlers can tree-shake.

### Tailwind handling

Two sub-options:

- **a) Ship Tailwind source** — keep utility classes in JSX and instruct consumers to add the
  package to their `tailwind.config.js` `content` glob. Zero extra build step; standard shadcn
  convention.
- **b) Ship pre-built CSS** — run `@tailwindcss/vite` during the lib build to produce
  `dist/styles.css`; consumers `import "@pihanga2/shadcn-cards/styles.css"` once. More self-contained
  but consumers lose the ability to customise tokens.

### Pros

- **Simple delivery model** — one `npm install`, one import path.
- **Tree-shakeable** (ESM) — bundlers drop unused cards automatically via static analysis.
- **Aligned with how shadcn/Radix packages are distributed** — no novel conventions needed.
- **Single version** — no cross-package compatibility matrix.
- **Build tooling already in place** — Vite, TypeScript, and tsc are already installed; adding lib
  mode is a small config change.
- **Existing `dependencies.json` files** drive the `peerDependencies` list automatically.
- **Straightforward CI** — one build step, one publish step.

### Cons

- **Developer install footprint** — running `npm install` pulls the entire package's source into
  `node_modules` regardless of how many cards are actually used. This is a developer-machine cost
  (disk space, install time, CI cache size), not something end-users see. The end-user **bundle
  size** is unaffected because proper ESM tree-shaking eliminates unused card code from the final
  build.
- **Heavy optional deps** — `@antv/g6` / `@antv/graphin` (graphin card) appear in the package
  manifest, which has two separate implications worth distinguishing:

  | Concern | `dependencies` | `peerDependencies` |
  |---|---|---|
  | **Install-time** (`npm install`) | AntV packages are downloaded & written to `node_modules` for **every consumer**, even if they never use the graphin card. Adds ~5 MB and extra install time universally. | AntV packages are **not installed** unless the consumer explicitly adds them. No install overhead for non-graph users. |
  | **Bundle-time** (final app size) | Depends on tree-shaking — see below. | Same. |

  **Tree-shaking and the bundle**: If the package ships as proper **ESM** with per-card entry
  points (e.g. `@pihanga2/shadcn-cards/graphin` vs `@pihanga2/shadcn-cards/button`), a consumer
  who never imports the graphin card path will have **zero AntV code in their final bundle** —
  the bundler (Vite/webpack) simply never traverses that module graph. This is true regardless of
  whether AntV is in `dependencies` or `peerDependencies`.

  The risk arises only if the package exposes a **single root barrel** (`import "@pihanga2/shadcn-cards"`)
  that re-exports every card: every `index.ts` calls `registerCardComponent(...)` as a side-effect
  at import time, forcing the bundler to include all cards (and all their deps, including AntV).
  The mitigation is to either (a) use per-card sub-path exports or (b) mark individual card
  `index.ts` files in `"sideEffects"` so bundlers can skip un-imported ones.

  **Summary for this con:** the install-time concern is real and is solved by using
  `peerDependencies`; the bundle-size concern is a non-issue with proper per-card ESM entry points
  and does not require splitting into separate packages.
- **Side-effect registration** — because each `index.ts` calls `registerCardComponent()` at import
  time, consumers must import individual card paths (e.g. `import "@pihanga2/shadcn-cards/button"`)
  rather than the root barrel, *or* accept that all cards register on first import.
- **CSS strategy requires a decision** — shipping Tailwind source or pre-built CSS each have
  trade-offs (see above).

### Effort estimate: **Low–Medium** (1–3 days)

---

## Option B — Monorepo with Individual Card Packages

### What it is

Convert the repo to a **yarn/npm workspace monorepo**. Each card folder (and the shared
`src/components/` layer) becomes its own NPM package:

```
packages/
  components/       # @pihanga2/shadcn-components (shadcn wrappers, hooks, utils)
  cards-button/     # @pihanga2/card-button
  cards-badge/      # @pihanga2/card-badge
  cards-dataTable/  # @pihanga2/card-data-table
  …
  playground/       # (private, not published)
```

### Pros

- **Consumers install only what they use** — e.g., `npm install @pihanga2/card-button` without
  pulling in the graphin card's heavy AntV dependencies.
- **Independent versioning** — a fix to the `dataTable` card gets its own patch release without
  bumping the unrelated `badge` card.
- **Clear dependency boundaries** — each card's `dependencies.json` maps directly to its
  `package.json`; no hidden coupling.
- **Compatible with pnpm catalog / Renovate automation** — large ecosystems (e.g. Radix UI) do this
  successfully.

### Cons

- **High setup overhead** — ~25+ cards × build pipeline = significant scaffolding effort.
- **Shared `src/components/ui/` becomes a versioning dependency** — every card depends on
  `@pihanga2/shadcn-components`; a breaking change there forces a major-version bump of every card
  simultaneously (defeating the independent-versioning benefit).
- **Changelog & release complexity** — tooling like Changesets or Lerna is required; extra learning
  curve.
- **Duplicated build configuration** — unless a shared Vite/tsconfig preset is extracted carefully,
  each package drifts.
- **Consumer install UX is worse** — users must discover and install many small packages; shadcn
  itself solved this by switching to a *copy* model (Option D) rather than individual NPM packages.
- **Tailwind content paths multiply** — consumers may need to add every installed sub-package to
  their Tailwind config.

### Effort estimate: **High** (1–2 weeks of restructuring)

---

## Option C — Single Package, Split by Feature Group

### What it is

A middle ground: publish **2–4 packages**, grouped by weight of dependencies, e.g.:

| Package | Contents | Heavy deps |
|---|---|---|
| `@pihanga2/shadcn-core-cards` | badge, button, box, field, flexGrid, form, input, list, menu, select, stack, tabs, typography, … | none beyond Radix |
| `@pihanga2/shadcn-data-cards` | dataTable, jsonViewer, markdownViewer | react-json-view-lite, rehype-highlight, etc. |
| `@pihanga2/shadcn-graph-cards` | graphin | @antv/g, @antv/g6, @antv/graphin |

### Pros

- **Isolates the heaviest deps** — the graph card's 5 MB of AntV code never lands in apps that
  don't need it.
- **Manageable number of packages** — 3–4 is very different from 25+.
- **Simpler than full monorepo** — one workspace, a handful of build targets.
- **Reasonable versioning story** — a graph card upgrade is decoupled from core cards.

### Cons

- **Grouping is somewhat arbitrary** — when a new "heavy" card is added, deciding which package it
  belongs to creates friction.
- **Shared components layer still needs its own package or is duplicated** — same structural problem
  as Option B, but smaller scale.
- **More build complexity than Option A** — three `vite build` invocations, three `package.json`
  manifests.
- **Still requires consumer to know about the split** — discovery is slightly worse than a single
  package.

### Effort estimate: **Medium** (3–5 days)

---

## Option D — shadcn-Style Registry (Copy-on-Install)

### What it is

Instead of publishing compiled NPM packages, publish a **shadcn component registry** (a JSON
manifest + source files hosted at a URL or on npm as raw source). Consumers run:

```sh
npx shadcn@latest add https://your-registry.com/r/button
```

This *copies* the card's source files directly into the consumer's project, alongside the shared
components they need.

This approach is exactly what shadcn/ui itself uses, and it is already partially scaffolded in this
repo via `scripts/gen-playground-registry.mjs` and the existing `components.json`.

### Pros

- **No build step required for distribution** — the source IS the package.
- **Consumers own the code** — they can customise individual cards freely without forking the package.
- **No Tailwind content-path problem** — the files land directly in the consumer's `src/`; Tailwind
  already scans it.
- **No peer-dependency management** — the registry manifest lists what `npm install`s are needed;
  shadcn CLI handles it.
- **Automatic dependency installation** — the shadcn registry JSON format has a first-class
  `dependencies` field. When a consumer runs `npx shadcn@latest add`, the CLI reads this field and
  automatically runs `npm install` (or `yarn add` / `pnpm add`) for every listed package. No
  manual "also install these peer deps" documentation needed.

  Each card's `dependencies.json` maps **directly** onto the registry format:

  ```jsonc
  // src/cards/select/dependencies.json  (source of truth in this repo)
  {
    "dependencies": { "@radix-ui/react-select": "^2.2.6" },
    "devDependencies": {}
  }
  ```

  The registry generation script reads this and emits:

  ```jsonc
  // public/r/select.json  (generated)
  {
    "name": "select",
    "type": "registry:component",
    "dependencies": ["@radix-ui/react-select@^2.2.6"],
    "registryDependencies": ["pihanga-base", "utils"],
    "files": [ … ]
  }
  ```

  The CLI then installs `@radix-ui/react-select` automatically as part of the `add` command —
  the consumer never needs to look up or manually install card-specific packages.

  The `registryDependencies` field handles **cross-component dependencies** too: if the `select`
  card needs the shadcn `select` UI primitive (`src/components/ui/select.tsx`), that primitive can
  be declared as a `registryDependency` and the CLI will fetch and copy it alongside the card,
  recursively resolving the full dependency tree.

  **`@pihanga2/core` is also solved by this mechanism.** The registry can include a
  `pihanga-base` entry — a lightweight meta-component with no files, whose sole purpose is to
  declare the Pihanga runtime as a dependency:

  ```jsonc
  // public/r/pihanga-base.json
  {
    "name": "pihanga-base",
    "type": "registry:component",
    "dependencies": ["@pihanga2/core"],
    "files": []
  }
  ```

  Every card then lists `"pihanga-base"` as a `registryDependency`. When a consumer adds any card
  for the first time, the CLI fetches `pihanga-base`, sees `@pihanga2/core` in its `dependencies`,
  and installs it automatically — without any manual step from the developer.

  **End-to-end consumer experience with this approach:**
  ```sh
  npx shadcn@latest init                               # one-time: creates components.json + @/ alias
  npx shadcn@latest add https://…/r/select             # installs @radix-ui/react-select AND @pihanga2/core
                                                       # automatically, then copies the card source
  ```

  The `npm install @pihanga2/core` step from the `AGENT.md` prerequisites is no longer needed
  as a manual step — it is handled by the registry itself.

  This is a significant advantage over Option A, where consumers must discover and install peer
  dependencies manually.
- **Already partially implemented** — `gen-playground-registry.mjs` and `dependencies.json` files
  lay the groundwork.
- **Aligns with shadcn/ui best practices** — the ecosystem is moving towards registries for sharing
  component collections.
- **Handles the `@/` alias naturally** — copied files land at `src/components/ui/` just like native
  shadcn components.

### Cons

- **Not a traditional NPM package** — teams that expect `npm install` + import won't get that DX.
- **Updates are not automatic** — consumers must re-run the `add` command to get new versions; there
  is no `npm update`.
- **Version pinning is manual** — the registry URL must include a version segment, or consumers
  risk receiving breaking changes on re-install.
- **Increased consumer responsibility** — bugs/fixes in shared components must be applied to
  everyone who copied the code.
- **Hosting required** — ✅ **already solved by this GitHub repo.** Two mechanisms work
  out-of-the-box:

  **Option D1 — GitHub Pages (recommended)**

  Vite already has a `public/` folder whose contents are:
  - served at the root in dev (`http://localhost:5173/r/button.json`) — so you can test the
    registry locally during development
  - copied verbatim into `dist/` on `vite build`

  Generate the registry JSON into `public/r/` (one file per card plus an `index.json` manifest),
  then enable GitHub Pages to serve the `dist/` output. Registry URLs become:
  ```
  https://ivcap-works.github.io/pihanga-shadcn/r/button
  https://ivcap-works.github.io/pihanga-shadcn/r/dataTable
  ```

  A consumer adds a card with:
  ```sh
  npx shadcn@latest add https://ivcap-works.github.io/pihanga-shadcn/r/button
  ```

  **Version pinning** is handled with git tags. GitHub Pages can serve from a branch; a CI job
  tags each release and deploys that tag's `dist/` to a versioned sub-path or the `gh-pages`
  branch, giving stable versioned URLs:
  ```
  https://ivcap-works.github.io/pihanga-shadcn/v1.2.0/r/button
  ```

  **Option D2 — raw GitHub content URLs (zero setup)**

  The shadcn CLI accepts any HTTPS URL that returns JSON. GitHub's raw content CDN works directly:
  ```
  https://raw.githubusercontent.com/ivcap-works/pihanga-shadcn/main/public/r/button.json
  ```
  Pin to a specific tag for stability:
  ```
  https://raw.githubusercontent.com/ivcap-works/pihanga-shadcn/v1.2.0/public/r/button.json
  ```
  No Pages setup needed at all — just commit the generated JSON files to the repo and reference
  them by raw URL. This is the fastest path to a working registry.

  **What still needs to be built:** a new script (extending or replacing `gen-playground-registry.mjs`)
  that emits the shadcn `registry.json` format (with `name`, `type`, `files`, `dependencies`,
  `registryDependencies` fields) into `public/r/`. The existing `dependencies.json` files and card
  folder layout provide all the raw data; it is primarily a JSON transformation task.
- **Consumer project setup** — the shadcn CLI drives its entire copy-and-rewrite process from a
  `components.json` file in the consumer's project root. Here is what that means in practice:

  **What `components.json` provides to the CLI:**
  | Field | Purpose |
  |---|---|
  | `aliases.ui` | Where to write shadcn UI primitives (e.g. `@/components/ui`) |
  | `aliases.utils` | Where `cn()` and other utils live |
  | `aliases.hooks` | Where shared hooks land |
  | `tailwind.css` | Which CSS file to inject Tailwind layers/variables into |
  | `style` | Which shadcn variant (`"new-york"` vs `"default"`) the primitives use |

  When the CLI copies a file from the registry it **rewrites all `@/…` imports** inside it to match
  the consumer's aliases. Without `components.json` the CLI either errors out or runs
  `npx shadcn@latest init` interactively first.

  **How a consumer gets `components.json`:** run `npx shadcn@latest init` once. This command:
  1. Creates `components.json`
  2. Adds the `@/` path alias to `tsconfig.json`
  3. Sets up Tailwind CSS (installs it, creates/patches the config)
  4. Optionally seeds CSS variable tokens in the global stylesheet

  **Is this actually a burden?** For the *expected* audience — projects already built on
  shadcn/Radix — the answer is **no**: they already ran `init` when they first adopted shadcn.
  Since `pihanga-shadcn` is explicitly layered on top of shadcn's component primitives, a consumer
  who installs these cards almost certainly already has `components.json` in place with identical
  aliases (`@/components/ui`, `@/lib/utils`, etc.).

  For a greenfield project with no shadcn setup at all, `npx shadcn@latest init` is a one-time,
  five-minute step with good documentation — not a significant barrier.

  **The Pihanga-specific wrinkle:** shadcn registries are designed for plain UI components.
  Pihanga cards are *not* plain UI components — they call `registerCardComponent(...)` at import
  time, import from `@pihanga2/core`, and may reference cross-card paths like
  `@/cards/form/form.context`. The shadcn CLI will copy the files and rewrite the `@/components/ui`
  references correctly, but:
  - `@pihanga2/core` ✅ installed automatically via the `pihanga-base` registry entry (see
    "Automatic dependency installation" in the Pros above).
  - The `src/cards/` folder layout (where Pihanga-specific files live) is not a standard shadcn
    convention — the registry manifest would need to map these files to `registry:component` type
    (not `registry:ui`) and consumers would need the `src/cards/` path to exist or be created.
  - The existing `scripts/gen-playground-registry.mjs` generates an **internal playground
    registry** (for the playground UI), NOT a shadcn distribution registry. A new script would
    need to emit the `registry.json` format shadcn expects for public distribution.

  **Mitigation — `AGENT.md` for AI-assisted bootstrapping:**
  AI coding assistants (Cline, Cursor, Windsurf, etc.) read an `AGENT.md` (or `CLAUDE.md`,
  `.cursorrules`, etc.) from the project root at the start of every task. Shipping an `AGENT.md`
  alongside the registry — or as part of the registry's documentation artifact — lets an AI agent
  autonomously perform the prerequisite steps when helping a developer set up a new app:

  ```markdown
  ## Prerequisites for pihanga-shadcn cards

  Before adding any cards, ensure the following are in place:

  1. Initialise shadcn (creates components.json and the @/ alias):
       npx shadcn@latest init

  2. Then add individual cards — @pihanga2/core and all card-specific packages are installed
     automatically by the registry CLI:
       npx shadcn@latest add https://ivcap-works.github.io/pihanga-shadcn/r/<card-name>
  ```

  A new app always has a `package.json`, which is all the agent needs to anchor the commands.
  The agent reads `AGENT.md`, runs the single prerequisite command (`shadcn init`), and then
  proceeds with `add`. The registry handles everything else — `@pihanga2/core`, all card-specific
  npm packages, and any shared UI primitives — automatically.
  This converts the "consumer project setup" concern from a manual documentation problem into an
  automated, agent-driven workflow with just two commands total.

  What `AGENT.md` cannot help with is a **human developer** who isn't using an AI assistant.
  For those users a short `QUICKSTART.md` or a dedicated init command (e.g.
  `npx pihanga-shadcn init`) provides the same guidance in a traditional form. Both can coexist.

### Effort estimate: **Low** (1–2 days, leveraging existing scripts)

---

## Decision (implemented)

**Option A + Option D in parallel** — both distribution channels run from the same source.

| Channel | Package | How | Script |
|---|---|---|---|
| shadcn registry (Option D) | — | `npx shadcn@latest add <url>` | `make gen-registry` |
| npm package (Option A) | `@pihanga2/shadcn` | `npm install @pihanga2/shadcn` | `make build-core` |

### Files added

| File | Purpose |
|---|---|
| `scripts/core-cards.json` | Allowlist of cards included in the npm package (single source of truth) |
| `vite.lib.config.ts` | Vite library-mode build config — per-card ESM entry points, `vite-plugin-dts` for types |
| `scripts/build-core.mjs` | Orchestration: generates barrel, runs Vite, writes `dist-lib/package.json` + `README.md` |

### Core card subset (`@pihanga2/shadcn`)

Included (30 cards — only Radix UI + light deps):
badge, box, button, checkbox, conditional, dataTable, dialog, dropDownMenu, field, flexGrid, form,
framework, input, list, loadingOverlay, loadingSkeleton, menu, modeToggle, navbarSearch,
pageWithNavbar, pasteTarget, select, stack, stepper, switch, tabs, textField, toast, toggleGroup, typography

Excluded (registry-only):

| Card | Reason |
|---|---|
| `graphin` | AntV deps (`@antv/g`, `@antv/g6`, `@antv/graphin`) — ~5 MB install footprint |
| `jsonViewer` | `react-json-view-lite` — optional viewer |
| `markdownViewer` | `mermaid` + `remark`/`rehype` stack — heavy markdown pipeline |
| `resizable` | `react-resizable-panels` — optional layout primitive |

### npm package structure

```
dist-lib/
  cards/
    core-index.js / .d.ts     ← root barrel (all core cards)
    button/index.js / .d.ts   ← per-card entry (tree-shakeable)
    dialog/index.js / .d.ts
    …
  lib/utils.js / .d.ts
  package.json                ← generated by build-core.mjs
  README.md
```

**Consumer usage:**
```ts
// All core cards at once:
import "@pihanga2/shadcn";

// Only specific cards (tree-shakeable):
import "@pihanga2/shadcn/cards/button";
import "@pihanga2/shadcn/cards/dialog";
```

### Dependency strategy

| Type | Packages |
|---|---|
| `peerDependencies` | `react`, `react-dom`, `@pihanga2/core` |
| `dependencies` | all Radix UI, `lucide-react`, `clsx`, `class-variance-authority`, `tailwind-merge`, `sonner` |

### Tailwind CSS

Ship Tailwind source (standard shadcn convention). Consumer adds one line:
```css
/* tailwind.css — Tailwind v4 */
@source "../../node_modules/@pihanga2/shadcn/dist-lib";
```

---

## Original recommendation

### Recommended approach: **Option A (single package) + Option D (registry) in parallel**

1. **Short-term / immediate value (Option A):**
   Start with a single `@pihanga2/shadcn-cards` package using Vite library mode. This unblocks
   consumers who want a traditional `npm install` workflow immediately and requires minimal
   restructuring of the existing codebase.

   Key steps:
   - Add `vite.lib.config.ts` with `preserveEntrySignatures`, `external` list, and `rollupOptions`.
   - Add `vite-plugin-dts` for `.d.ts` generation.
   - Create a `src/cards/index.ts` barrel (or per-card entry points via `rollupOptions.input`).
   - Change `"private": false`, set `"name"`, `"version"`, `"exports"`, `"peerDependencies"` in
     `package.json`.
   - Decide on Tailwind strategy: ship source (simpler) or pre-built CSS.
   - Add a `scripts/build-lib.sh` and a `publish` script.
   - Add the `graphin` card to a separate optional entry point to keep the main bundle lean.

2. **Medium-term (Option D):**
   Extend the existing registry scripts to publish a full shadcn-compatible registry. This is the
   most future-proof distribution method and aligns with where the shadcn ecosystem is heading. The
   `dependencies.json` files are already the right shape for registry metadata.

### If consumer adoption is the priority over DX: **Option A alone**
### If you want maximum flexibility for consumers and minimal maintenance: **Option D alone**
### If the graphin card's dependencies are a blocker: **Option C** (split `@pihanga2/shadcn-graph-cards` off)

---

## Pre-publish Checklist (applicable to any option)

- [ ] Remove or exclude all `src/playground/`, `src/app.*`, `src/main.ts` from the published output.
- [ ] Resolve what to do with `*.example.ts` files — exclude from prod build or include as optional
      documentation exports.
- [ ] Audit `dependencies.json` files for accuracy (run `yarn gen-card-deps`).
- [ ] Decide which packages are `dependencies` vs `peerDependencies` in the published manifest.
      Rule of thumb: anything the consumer's app also uses (React, Radix UI, Tailwind, `@pihanga2/core`)
      should be a `peerDependency`.
- [ ] Decide on Tailwind CSS shipping strategy (source vs pre-built CSS).
- [ ] Set up semantic versioning and a CHANGELOG (e.g. `conventional-commits` + `release-it` or
      GitHub Actions `semantic-release`).
- [ ] Add a `.npmignore` or `"files"` field in `package.json` to exclude non-published files.
- [ ] Verify the package builds and types resolve correctly in a fresh consumer project before first
      publish (use `npm link` or `yalc`).
- [ ] Set up a GitHub Actions workflow for automated publishing on tag push.

---

## Open Questions

1. **Package name** — `@pihanga2/shadcn-cards`? `@pihanga2/ui`? Something else?
2. **Registry hosting** — ✅ resolved: this GitHub repo serves as the host via GitHub Pages
   (`https://ivcap-works.github.io/pihanga-shadcn/r/…`) or raw GitHub content URLs
   (`https://raw.githubusercontent.com/ivcap-works/pihanga-shadcn/<tag>/public/r/…`).
   No external hosting infrastructure required.
3. **Graphin card** — should it be excluded from the initial publish given the heavy AntV deps?
   It could be in a separate optional entry or a separate package to avoid inflating the install
   footprint for consumers who don't need graph visualisations.
4. **Tailwind version** — the repo uses Tailwind v4. Most shadcn consumers are on v3 today. Will
   consumers be required to be on v4, or should the pre-built CSS option be the default to
   stay version-agnostic?
5. **CSS layers** — Tailwind v4 uses CSS `@layer`; does this need special handling in the dist CSS?
