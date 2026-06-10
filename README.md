# pihanga-shadcn

A collection of **Pihanga cards** built on top of [shadcn/ui](https://ui.shadcn.com/) and
[Radix UI](https://radix-ui.com/), distributed through two channels: a
**shadcn copy-on-install registry** and a traditional **`@pihanga2/shadcn` npm package**.

**For users of the cards** (install, wire, build apps):
→ [USER_GUIDE.md](./USER_GUIDE.md) · [AGENT.md](./AGENT.md) (AI assistants)

> 💬 **Found a bug, a missing card, or have a suggestion?**
> Please open an issue at **https://github.com/ivcap-works/pihanga-shadcn/issues**
> — card requests, integration problems, and documentation improvements are all
> very welcome.

---

## Table of Contents

- [Stack](#stack)
- [This repo: dual playground + card library](#this-repo-dual-playground--card-library)
- [Project structure](#project-structure)
- [Development commands](#development-commands)
- [Distribution channels](#distribution-channels)
  - [Registry (Option D) — `make gen-registry`](#registry-option-d--make-gen-registry)
  - [npm package (Option A) — `make build-core`](#npm-package-option-a--make-build-core)
- [Managing the core-cards allowlist](#managing-the-core-cards-allowlist)
  - [When to include a card in the npm package](#when-to-include-a-card-in-the-npm-package)
  - [When to keep a card registry-only](#when-to-keep-a-card-registry-only)
- [Adding a new card](#adding-a-new-card)
- [Adding shadcn/ui primitives](#adding-shadcnui-primitives)
- [Available cards](#available-cards)

---

## Stack

| Layer | Tool |
|---|---|
| Card framework | [@pihanga2/core](https://github.com/ivcap-works/pihanga) — declarative card system + Redux |
| Build | [Vite](https://vite.dev/) v8 |
| UI | [React](https://react.dev/) v19 |
| Language | [TypeScript](https://www.typescriptlang.org/) ~5.8 |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4 |
| Components | [shadcn/ui](https://ui.shadcn.com/) (new-york) + [Radix UI](https://www.radix-ui.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Linting | ESLint v9 (flat config) + typescript-eslint |
| Testing | Vitest + Testing Library |

---

## This repo: dual playground + card library

This repository serves **two separate audiences** from the same source tree:

```mermaid
flowchart LR
    SRC["src/cards/\n(source of truth)"]
    PG["Vite playground app\n(src/app.*, src/main.ts,\nsrc/playground/)"]
    REG["shadcn registry\npublic/r/*.json\n→ GitHub Pages"]
    NPM["npm package\ndist-lib/\n→ @pihanga2/shadcn"]

    SRC --> PG
    SRC --> REG
    SRC --> NPM
```

| Concern | Lives in | Relevant to |
|---|---|---|
| Playground / demo app | `src/app.*`, `src/main.ts`, `src/playground/` | **Contributors only** — not shipped to users |
| Card implementations | `src/cards/<name>/` | Both channels |
| shadcn UI primitives | `src/components/ui/` | Both channels (read-only; managed by shadcn CLI) |
| Shared hooks / utils | `src/components/hooks/`, `src/lib/` | Both channels |
| Registry JSON | `public/r/` (generated) | Registry users |
| npm bundle | `dist-lib/` (generated) | npm users |

**The playground is an internal development tool** — it is not something consumers of the cards
interact with, and it is not shipped in either distribution channel.

---

## Project structure

```
src/
├── cards/                    # Card library — one folder per card
│   ├── <cardName>/
│   │   ├── index.ts          # Registration + re-exports
│   │   ├── <card>.types.ts   # ID, Props, Events, action wiring
│   │   ├── <card>.component.tsx
│   │   ├── <card>.example.ts # Playground demo (not shipped)
│   │   └── dependencies.json # Per-card npm dep declarations
│   └── BUILDING_CARDS_HOWTO.md
├── components/
│   └── ui/                   # shadcn/ui primitives (auto-managed — do not edit)
├── lib/utils.ts              # cn() and shared utilities
├── playground/               # ← contributor/dev only
├── app.*                     # ← contributor/dev only
└── main.ts                   # ← contributor/dev only

scripts/
├── core-cards.json           # npm package allowlist (edit to add/remove cards)
├── build-core.mjs            # npm package build orchestrator
├── gen-registry.mjs          # shadcn registry generator
└── gen-card-dependencies.mjs # per-card dependency scanner

public/r/                     # generated registry JSON (committed to git)
dist-lib/                     # generated npm package (git-ignored)
vite.config.ts                # playground dev/build config
vite.lib.config.ts            # npm library build config
```

---

## Development commands

```sh
yarn install          # install dependencies (also: make install)

make dev              # start playground dev server
make build            # build playground production bundle → dist/
make check            # lint + type-check + tests (CI gate)
make test             # run tests (watch mode)
make test-run         # run tests once
make type-check       # TypeScript type checking
make lint             # ESLint
make lint-fix         # ESLint auto-fix
make clean            # remove dist/, dist-lib/, coverage/
```

---

## Distribution channels

Both channels are generated from the same `src/cards/` source and are
**independent** — updating one does not affect the other.

### Registry (Option D) — `make gen-registry`

Generates shadcn-compatible JSON files into `public/r/`.  Commit the output;
GitHub Pages serves it at `https://ivcap-works.github.io/pihanga-shadcn/r`.

```sh
make gen-registry                                    # regenerate all public/r/*.json
node scripts/gen-registry.mjs --dry-run             # preview without writing
node scripts/gen-registry.mjs --base-url http://localhost:5173  # local testing
```

Run this whenever you:
- add a new card
- rename any file in `src/cards/`
- change a card's dependencies

All cards (including the heavy ones) are included in the registry.

### npm package (Option A) — `make build-core`

Builds `@pihanga2/shadcn` into `dist-lib/` using Vite library mode.
Only the **core cards subset** (defined in `scripts/core-cards.json`) is included.

```sh
make build-core          # full build → dist-lib/ (generates barrel + runs Vite + writes package.json)
make build-core-dry      # dry-run: preview generated files without writing
```

To publish:
```sh
make publish          # build-core + npm publish --access public
```

The build pipeline (all orchestrated by `scripts/build-core.mjs`):
1. Reads `scripts/core-cards.json` for the card allowlist
2. Generates `src/cards/core-index.ts` (auto-generated barrel — do not commit)
3. Runs `vite build --config vite.lib.config.ts` → `dist-lib/cards/*/index.js`
4. Aggregates dependencies from each core card's `dependencies.json`
5. Writes `dist-lib/package.json` with full exports map and `sideEffects` list
6. Writes `dist-lib/README.md`

---

## Managing the core-cards allowlist

`scripts/core-cards.json` is the **single source of truth** for which cards appear
in the npm package.  Edit it to add or remove cards; the build picks up the change
automatically.

```json
{
  "cards": ["badge", "button", "dialog", ...],
  "excludeReason": {
    "graphin": "heavy AntV deps — ~5 MB install",
    ...
  }
}
```

### When to include a card in the npm package

Include a card if **all** of the following are true:

- Its `dependencies.json` contains only **Radix UI packages** and/or widely-used
  light utilities (`clsx`, `lucide-react`, `class-variance-authority`, `sonner`,
  `tailwind-merge`, `radix-ui`).
- No single dependency is larger than ~500 kB installed.
- The card is likely to be useful to the majority of apps adopting `@pihanga2/shadcn`.

### When to keep a card registry-only

Exclude a card from the npm package (registry-only) when it brings:

| Indicator | Examples | Action |
|---|---|---|
| Heavy optional dep (>1 MB) | `@antv/g6`, `mermaid`, `react-resizable-panels` | Exclude — add to `excludeReason` |
| Niche / specialised dep | `react-json-view-lite`, `rehype-*`, `remark-*` | Exclude unless broadly needed |
| Dep that duplicates a peer | Another React rendering library | Exclude |

Current excluded cards and their reasons are documented in `scripts/core-cards.json`
under `"excludeReason"`.

> **Rule of thumb:** if installing `@pihanga2/shadcn` would surprise a developer
> who only wants badge + button + form by downloading a graph visualisation library,
> that card does not belong in the npm package.

---

## Adding a new card

1. Create `src/cards/<name>/` with `index.ts`, `*.types.ts`, `*.component.tsx`,
   `dependencies.json`, `*.example.ts`.
2. Run `yarn gen-card-deps` to auto-populate `dependencies.json`.
3. Run `make gen-registry` to emit the registry JSON.
4. **Decide on npm inclusion:** if the card's deps qualify (see above), add its name
   to the `"cards"` array in `scripts/core-cards.json`.  Run `make build-core-dry`
   to verify the generated `package.json` looks correct.
5. Check `make check` passes.

See `USER_GUIDE.md` Part 2 and `AGENT.building-cards.md` for the full card-creation
walkthrough.

---

## Adding shadcn/ui primitives

`src/components/ui/` is managed exclusively by the shadcn CLI — **never edit files there manually**.

```sh
npx shadcn@latest add button
npx shadcn@latest add tooltip
```

After adding a new primitive, run `yarn gen-card-deps` on any card that uses it so
its `dependencies.json` stays accurate.

---

## Available cards

| Card | Registry ID | npm import | Notes |
|---|---|---|---|
| badge | `/r/badge` | `/cards/badge` | |
| box | `/r/box` | `/cards/box` | |
| button | `/r/button` | `/cards/button` | |
| checkbox | `/r/checkbox` | `/cards/checkbox` | |
| conditional | `/r/conditional` | `/cards/conditional` | |
| dataTable | `/r/dataTable` | `/cards/dataTable` | |
| dialog | `/r/dialog` | `/cards/dialog` | |
| dropDownMenu | `/r/dropDownMenu` | `/cards/dropDownMenu` | |
| field | `/r/field` | `/cards/field` | |
| flexGrid | `/r/flexGrid` | `/cards/flexGrid` | |
| form | `/r/form` | `/cards/form` | |
| framework | `/r/framework` | `/cards/framework` | App root |
| graphin | `/r/graphin` | registry only | ⚠️ Heavy AntV deps |
| input | `/r/input` | `/cards/input` | |
| jsonViewer | `/r/jsonViewer` | registry only | |
| list | `/r/list` | `/cards/list` | |
| loadingOverlay | `/r/loadingOverlay` | `/cards/loadingOverlay` | |
| loadingSkeleton | `/r/loadingSkeleton` | `/cards/loadingSkeleton` | |
| markdownViewer | `/r/markdownViewer` | registry only | ⚠️ Heavy markdown deps |
| menu | `/r/menu` | `/cards/menu` | |
| modeToggle | `/r/modeToggle` | `/cards/modeToggle` | |
| navbarSearch | `/r/navbarSearch` | `/cards/navbarSearch` | |
| pageWithNavbar | `/r/pageWithNavbar` | `/cards/pageWithNavbar` | |
| pasteTarget | `/r/pasteTarget` | `/cards/pasteTarget` | |
| resizable | `/r/resizable` | registry only | |
| select | `/r/select` | `/cards/select` | |
| stack | `/r/stack` | `/cards/stack` | |
| stepper | `/r/stepper` | `/cards/stepper` | |
| switch | `/r/switch` | `/cards/switch` | |
| tabs | `/r/tabs` | `/cards/tabs` | |
| textField | `/r/textField` | `/cards/textField` | |
| toast | `/r/toast` | `/cards/toast` | |
| toggleGroup | `/r/toggleGroup` | `/cards/toggleGroup` | |
| typography | `/r/typography` | `/cards/typography` | |

Registry base URL: `https://ivcap-works.github.io/pihanga-shadcn/r`
npm package: `@pihanga2/shadcn` (npm sub-path: `@pihanga2/shadcn/cards/<name>`)
