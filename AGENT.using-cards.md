# AGENT.using-cards.md — consuming pihanga-shadcn cards

> **Scope:** installing, wiring, composing, and navigating with existing cards.
> Read [`AGENT.md`](./AGENT.md) first for orientation and universal rules.
> If you need to *create* a new card type, switch to
> [`AGENT.building-cards.md`](./AGENT.building-cards.md).
>
> **Starting from scratch?**  Follow [`AGENTS.getting-started.md`](./AGENTS.getting-started.md)
> first to scaffold your Vite project, run `shadcn init`, install `@pihanga2/core`,
> and wire up the initial file layout.  Return here once the scaffold is in place.

> 💬 **Encountered a bug, a missing card, or an agent-unfriendly doc section?**
> Please open an issue at **https://github.com/ivcap-works/pihanga-shadcn/issues**
> — card suggestions and AI agent experience reports are especially welcome.

---

> ### ⚠️ Check before you code — always search for an existing card first
>
> Before writing a new card component, **thoroughly check whether a suitable
> card already exists** in both the registry (34 cards) and the npm package
> (30 cards).  Use the [Available cards](#available-cards) table below, and
> look carefully at non-obvious names — for example, the controlled text input
> is `pi/input` (`PiInput`), not `pi/text-input`; the graph visualiser is
> `shad/graphin`; layout cards include `pi/flex-grid`, `pi/stack`, and
> `pi/resizable`.
>
> **Why this matters:** writing a new component is quick, but a locally-owned
> card creates an ongoing maintenance burden — it must be kept in sync with
> shadcn/ui and Radix UI updates, it won't appear in the playground
> automatically, and it won't benefit from upstream bug fixes.
>
> **If no suitable card exists:**
> - Confirm the need is genuine and not already covered by composing existing
>   cards (`Conditional`, `FlexGrid`, `Stack`, `Box`).
> - Unless the card would expose confidential business logic, please
>   **open an issue** at
>   `https://github.com/ivcap-works/pihanga-shadcn/issues` describing what you
>   need.  This helps the maintainers prioritise new cards and prevents the
>   same gap from being worked around independently by multiple teams.
> - Only proceed to implement a local card after the above checks.

---

## Table of Contents

- [Distribution channels — choose one](#distribution-channels--choose-one)
- [Channel 1 — shadcn registry (one-time project setup)](#channel-1--shadcn-registry-one-time-project-setup)
- [Channel 2 — npm package `@pihanga2/shadcn`](#channel-2--npm-package-pihanga2shadcn)
  - [Migrating a card from npm to a local copy](#migrating-a-card-from-npm-to-a-local-customised-copy)
- [Vite configuration (both channels)](#vite-configuration-both-channels)
  - [`@pihanga2/cards` — deprecated, do not use](#pihanga2cards--deprecated-do-not-use)
  - [Type-only import gotcha](#type-only-import-gotcha--picardref-store-etc)
  - [Transitive card dependencies](#transitive-card-dependencies)
- [Adding individual cards](#adding-individual-cards)
- [Notes for AI agents](#notes-for-ai-agents)
- [Using cards in your app](#using-cards-in-your-app)
- [Version pinning](#version-pinning)
- [Bootstrapping a pihanga app (init pattern)](#bootstrapping-a-pihanga-app-init-pattern)
- [`memo()` — reactive state-driven props](#memo--reactive-state-driven-props)
- [Multi-page navigation with `PageWithNavbar`](#multi-page-navigation-with-pagewithnavbar)
- [`MarkdownViewer` — inline source vs. fetched path](#markdownviewer--inline-source-vs-fetched-path)
- [`registerFramework` — only one active at a time](#registerframework--only-one-active-at-a-time)
- [Card API quick reference — common naming gotchas](#card-api-quick-reference--common-naming-gotchas)
  - [`pi/button` — theming the `brand` variant](#pibutton--theming-the-brand-variant)
- [Known gaps identified during AI agent evaluations](#known-gaps-identified-during-ai-agent-evaluations)

---

## Distribution channels — choose one

| | Registry | npm package |
|---|---|---|
| **Install** | `npx shadcn@latest add <url>` (or `yarn dlx shadcn@latest add <url>`) | `npm install @pihanga2/shadcn` |
| **Cards available** | All 34 | 30 core (no graphin / jsonViewer / markdownViewer / resizable) |
| **Requires `shadcn init`** | Yes | No |
| **Files land in your project** | Yes — editable source | No — compiled bundle |
| **Tailwind** | Consumer's own Tailwind config | Add `@source` pointing at `node_modules/@pihanga2/shadcn/dist-lib` |

Use the **registry** for projects already on shadcn/ui or when you want to
customise card source.  Use the **npm package** for monorepos, CI, or anywhere
a clean `npm install` workflow is preferred.

---

## Channel 1 — shadcn registry (one-time project setup)

> **New project?** The full one-time setup (Vite scaffold, shadcn init, Tailwind
> theme, Vite aliases, pihanga-core install) is documented step-by-step in
> **[`AGENTS.getting-started.md`](./AGENTS.getting-started.md)**.  Follow that
> guide first, then return here to install and wire individual cards.

Key things the setup guide covers:

- **⚠️ npx + npm 11 + Node 24 incompatibility** — use `nvm use 22` or `yarn dlx`
  as a drop-in (see getting-started § *npx compatibility*)
- `npx shadcn@latest init` / `yarn dlx shadcn@latest init` — creates
  `components.json`, patches `tsconfig.json` with `@/*` alias, installs Tailwind
- `src/index.css` — requires a full `@theme inline` block; without it `bg-card`,
  `bg-background` etc. render transparent and dialogs appear invisible
- `src/components/lib/utils.ts` — must create the `cn()` helper at this path
- `vite.config.ts` aliases — `@/lib`, `@/registry`, `@/components`, `@/cards`, `@`

---

## Channel 2 — npm package `@pihanga2/shadcn`

No shadcn CLI or `components.json` required.

```sh
npm install @pihanga2/shadcn
# or: yarn add @pihanga2/shadcn  /  pnpm add @pihanga2/shadcn
```

Activate cards in the app entry point:

```ts
// Activate all 30 core cards at once (side-effecting import)
import "@pihanga2/shadcn";

// OR activate only what you need (tree-shakeable):
import "@pihanga2/shadcn/cards/button";
import "@pihanga2/shadcn/cards/form";
import "@pihanga2/shadcn/cards/framework";
```

Each import calls `registerCardComponent(...)` — no further activation needed.
Then use `registerCard(...)` in your init function exactly as with the registry.

**Cards NOT in the npm package** (registry-only due to heavy deps):
`graphin`, `jsonViewer`, `markdownViewer`, `resizable`.

**Tailwind:** add `@source` to your CSS so Tailwind can scan the package:
```css
/* src/index.css — Tailwind v4 */
@import "tailwindcss";
@source "../../node_modules/@pihanga2/shadcn/dist-lib";
```

### Migrating a card from npm to a local customised copy

When you need to modify a card that came from the npm package (custom styling,
extra props, different behaviour), follow this three-step pattern:

**Step 1 — Switch from the all-at-once import to per-card imports**

```ts
// Before — no control over individual cards:
import "@pihanga2/shadcn";

// After — omit the card you want to customise:
import "@pihanga2/shadcn/cards/badge";
import "@pihanga2/shadcn/cards/form";
// import "@pihanga2/shadcn/cards/button";   ← omit
import "@pihanga2/shadcn/cards/dialog";
// … rest of your cards
```

**Step 2 — Install the card from the registry (copies source into your project)**

```sh
npx shadcn@latest add https://ivcap-works.github.io/pihanga-shadcn/r/button.json
# → creates src/cards/button/ and installs its npm deps
```

**Step 3 — Import your local copy**

```ts
import "./cards/button";   // registers with the SAME card ID as the npm version
```

The local `index.ts` calls `registerCardComponent({name: "shad/button", …})` —
the **same card ID** as the npm build — so all existing `registerCard()` calls
in your app continue to work with zero changes.

> **No import-order tricks required.**  There is exactly one registration as
> long as you omitted the npm sub-path import (step 1) and added the local
> import (step 3).

**Alternative — keep both and rename the local card**

If you want the npm version and your custom version to coexist side-by-side,
give the local card a distinct ID:

```ts
// src/cards/button/button.types.ts
// Before: export const BUTTON_CARD = "shad/button";
export const BUTTON_CARD = "myapp/custom-button";   // ← unique ID
```

Update every `registerCard` call that should use your version.  Calls that
reference `"shad/button"` still resolve to the npm build; calls referencing
`"myapp/custom-button"` resolve to your local copy.  No ambiguity, no
import-order dependency.

---

## Vite configuration (both channels)

> **Vite project setup** (aliases, `src/components/lib/utils.ts`, `src/index.css`)
> is documented in full in **[`AGENTS.getting-started.md`](./AGENTS.getting-started.md)
> — Step 5 & Step 2**.  The sub-sections below cover **runtime-only gotchas** that
> apply regardless of when the project was scaffolded.

### `@pihanga2/cards` — deprecated, do not use

> ⚠️ **`@pihanga2/cards` is deprecated and should no longer be used.**
>
> All types previously imported from that package (`BoxProps`, `StackProps`, etc.)
> have been migrated into each card's own local `*.types.ts` file within this
> library (`src/cards/box/box.types.ts`, `src/cards/stack/stack.types.ts`, …).
>
> **Do not install `@pihanga2/cards` and do not add `import … from "@pihanga2/cards"`
> anywhere in this codebase or in consumer projects.**

### Type-only import gotcha — `PiCardRef`, `Store`, etc.

> ⚠️ **This is the most common runtime crash when bootstrapping from scratch.**

Several symbols exported by `@pihanga2/core` and `@reduxjs/toolkit` are
**TypeScript types with no runtime JS value** — they live only in `.d.ts` files.
If you import them without the `type` keyword, Vite/esbuild compiles them without
error, but the **browser crashes** at runtime with:

```
SyntaxError: The requested module '@pihanga2_core.js' does not
             provide an export named 'PiCardRef'
```

**Always use `import type` for these symbols:**

```ts
// ❌ Crashes at runtime — esbuild does not enforce verbatimModuleSyntax
import {PiCardRef} from "@pihanga2/core";
import {Store} from "@reduxjs/toolkit";

// ✅ Correct — type imports are erased before the browser sees the bundle
import type {PiCardRef} from "@pihanga2/core";
import type {Store} from "@reduxjs/toolkit";

// ✅ Also correct — inline type modifier
import {type PiCardRef, createCardDeclaration} from "@pihanga2/core";
```

Common type-only symbols in `@pihanga2/core`: `PiCardRef`, `ReduxState`,
`WindowProps`, `PiCardDef`, `PiMapProps`.

Common type-only symbols in `@reduxjs/toolkit`: `Store`.

### Transitive card dependencies

Some cards import internal helpers from *other* cards.  When you add a card to
`src/cards/` you must also add all its transitive dependencies — even if you
never reference those cards in `app.pihanga.ts`.

| Card you add | Also requires (import in `main.ts`) |
|---|---|
| `button` | `dropDownMenu` (imports `dropdown-context`) |
| `pageWithNavbar` | `modeToggle`, `navbarSearch`, `toast` |

Example `main.ts` import block when using `pageWithNavbar` and `button`:

```ts
// src/main.ts
import "@/cards/framework";
import "@/cards/pageWithNavbar";
import "@/cards/modeToggle";      // required by pageWithNavbar
import "@/cards/navbarSearch";    // required by pageWithNavbar
import "@/cards/toast";           // required by pageWithNavbar
import "@/cards/button";
import "@/cards/dropDownMenu";    // required by button
import "@/cards/stack";
import "@/cards/typography";
```

---

## Adding individual cards

### Registry channel

After the one-time setup (Channel 1 prerequisites above), add any card with a
single command. `@pihanga2/core` and all card-specific npm packages are
installed automatically.

> ⚠️ **npm 11 + Node 24:** `npx` fails on this combination — use Node 22 via
> `nvm use 22`, or use `yarn dlx` instead (see the
> [compatibility note above](#channel-1--shadcn-registry-prerequisites)).

```sh
# npm / npx (Node 22 recommended)
npx shadcn@latest add https://ivcap-works.github.io/pihanga-shadcn/r/button.json

# yarn (works on all supported Node versions)
yarn dlx shadcn@latest add https://ivcap-works.github.io/pihanga-shadcn/r/button.json

# Add multiple cards at once (npx)
npx shadcn@latest add \
  https://ivcap-works.github.io/pihanga-shadcn/r/button.json \
  https://ivcap-works.github.io/pihanga-shadcn/r/form.json \
  https://ivcap-works.github.io/pihanga-shadcn/r/dataTable.json

# Add multiple cards at once (yarn dlx)
yarn dlx shadcn@latest add \
  https://ivcap-works.github.io/pihanga-shadcn/r/button.json \
  https://ivcap-works.github.io/pihanga-shadcn/r/form.json \
  https://ivcap-works.github.io/pihanga-shadcn/r/dataTable.json
```

### npm channel

```ts
import "@pihanga2/shadcn/cards/button";   // activates shad/button
import "@pihanga2/shadcn/cards/form";     // activates pi/form
```

Or activate everything at once: `import "@pihanga2/shadcn"`.

### Available cards

| Card | Registry URL | In npm pkg | Notes |
|------|-------------|---|---|
| badge | `/r/badge` | ✅ | |
| box | `/r/box` | ✅ | |
| button | `/r/button` | ✅ | |
| checkbox | `/r/checkbox` | ✅ | |
| conditional | `/r/conditional` | ✅ | |
| dataTable | `/r/dataTable` | ✅ | |
| dialog | `/r/dialog` | ✅ | |
| dropDownMenu | `/r/dropDownMenu` | ✅ | |
| field | `/r/field` | ✅ | |
| flexGrid | `/r/flexGrid` | ✅ | |
| form | `/r/form` | ✅ | |
| framework | `/r/framework` | ✅ | App root |
| graphin | `/r/graphin` | ✗ | ⚠️ Heavy AntV deps |
| input | `/r/input` | ✅ | |
| jsonViewer | `/r/jsonViewer` | ✗ | optional viewer |
| list | `/r/list` | ✅ | |
| loadingOverlay | `/r/loadingOverlay` | ✅ | |
| loadingSkeleton | `/r/loadingSkeleton` | ✅ | |
| markdownViewer | `/r/markdownViewer` | ✗ | ⚠️ Heavy markdown deps |
| menu | `/r/menu` | ✅ | |
| modeToggle | `/r/modeToggle` | ✅ | |
| navbarSearch | `/r/navbarSearch` | ✅ | |
| pageWithNavbar | `/r/pageWithNavbar` | ✅ | |
| pasteTarget | `/r/pasteTarget` | ✅ | |
| resizable | `/r/resizable` | ✗ | optional layout |
| select | `/r/select` | ✅ | |
| stack | `/r/stack` | ✅ | |
| stepper | `/r/stepper` | ✅ | |
| switch | `/r/switch` | ✅ | |
| tabs | `/r/tabs` | ✅ | |
| textField | `/r/textField` | ✅ | |
| toast | `/r/toast` | ✅ | |
| toggleGroup | `/r/toggleGroup` | ✅ | |
| typography | `/r/typography` | ✅ | |

Full registry index: `https://ivcap-works.github.io/pihanga-shadcn/r/registry.json`

---

## Notes for AI agents

**Registry channel:**
- `npx shadcn@latest add <url>` automatically installs `@pihanga2/core` and all
  card-specific npm packages — no separate `npm install` needed.
- **`npx` fails on npm 11 + Node 24** — use `nvm use 22` or replace every
  `npx shadcn@latest` with `yarn dlx shadcn@latest` (identical output).
- Cards land at `src/cards/<card-name>/` in the consumer's project.
- The `framework` card is the Pihanga app root — add it first for new apps.
- `graphin` has heavy AntV dependencies (~5 MB) — only add if graph
  visualisation is explicitly required.

**npm channel:**
- `npm install @pihanga2/shadcn` is a single command — no `shadcn init` needed.
- Activate cards with `import "@pihanga2/shadcn"` (all) or per-card sub-paths.
- `graphin`, `jsonViewer`, `markdownViewer`, `resizable` are not in the npm
  package — use the registry for those.
- Point Tailwind at `node_modules/@pihanga2/shadcn/dist-lib` to scan classes.

**Both channels:**
- After activation, app-wiring APIs (`registerCard`, `registerFramework`,
  `register`, `memo`) are identical.
- `@pihanga2/core` must be importable — it is installed automatically by either
  channel (`peerDependency` for npm; auto-installed by shadcn CLI for registry).

---

## Using cards in your app

After installation, each card is registered automatically when imported.
Bootstrap Pihanga in your app entry point:

```ts
// ── Registry channel (cards copied to src/cards/) ────────────────────────
// src/main.ts
import "@pihanga2/core";
import "./cards/button";          // activates shad/button
import "./cards/form";            // activates pi/form
```

```ts
// ── npm channel ───────────────────────────────────────────────────────────
// src/main.ts
import "@pihanga2/shadcn";        // all 30 core cards at once
// OR selectively:
import "@pihanga2/shadcn/cards/button";
import "@pihanga2/shadcn/cards/form";
```

Then wire up cards identically regardless of channel:

```ts
// src/app.pihanga.ts
import {Button} from "@/cards/button";   // registry: local path
// import {Button} from "@pihanga2/shadcn/cards/button";  // npm: package path

registerCard("myApp/save", Button({
  id:    "save",
  label: "Save",
  opts:  {variant: "default"},
}));
```

---

## Version pinning

Use a git tag in the URL to pin to a specific release:

```sh
npx shadcn@latest add \
  https://raw.githubusercontent.com/ivcap-works/pihanga-shadcn/v1.0.0/public/r/button.json
```

Or with GitHub Pages versioned sub-paths (once published):

```sh
npx shadcn@latest add \
  https://ivcap-works.github.io/pihanga-shadcn/v1.0.0/r/button
```

---

## Bootstrapping a pihanga app (init pattern)

All app configuration lives in an `*init*` function (conventionally `appPiInit`)
that is called by `start()` in `src/main.ts`.  The function calls three core APIs:

| API | Purpose |
|-----|---------|
| `registerFramework(card)` | Sets the single root framework card. Call **once**. |
| `registerCard(id, card)` | Registers a named card so other cards can reference it by id. |
| `register(r => { … })` | Registers global event handlers / reducers. |

```ts
// src/main.ts
import {start, DEFAULT_REDUX_STATE} from "@pihanga2/core";
import {appPiInit} from "./app.pihanga";

start({...DEFAULT_REDUX_STATE}, [appPiInit], {
  rootComponent: RootComponent,
});
```

```ts
// src/app.pihanga.ts
import {registerFramework, registerCard, register} from "@pihanga2/core";
import {SdFramework} from "./cards/framework";

export function appPiInit(): void {
  registerFramework(SdFramework({page: "app/main", theme: "light"}));
  registerCard("app/main", /* … card def … */);
}
```

---

## `memo()` — reactive state-driven props

`memo(selector, mapper)` makes any card prop reactive.  The selector extracts a
slice of state; the mapper converts that slice into the final prop value.
Pihanga re-renders only when the selector's return value changes (shallow equal).

```ts
import {memo} from "@pihanga2/core";
import type {AppState} from "@/app.state";

// Switch the active card dynamically based on state.currentPage
main: memo(
  (s: AppState) => s.currentPage ?? "home",
  (page) => `app/page/${page}`,
),
```

`memo` can also produce arrays, objects, or any serialisable value:

```ts
items: memo(
  (s: AppState) => s.selectedId,
  (selectedId) => myList.map(item => ({...item, isSelected: item.id === selectedId})),
),
```

---

## Multi-page navigation with `PageWithNavbar`

The standard two-page (or N-page) pattern:

1. Add `navLinks` to `PageWithNavbar`.
2. Register an `onPageWithNavbarNavigateTo` handler that stores the clicked id
   in state.
3. Pass a `memo`-driven string to `main` so the rendered card changes with state.

```ts
import {
  PageWithNavbar,
  onPageWithNavbarNavigateTo,
} from "@/cards/pageWithNavbar";
import {memo, register, registerCard, registerFramework} from "@pihanga2/core";
import {SdFramework} from "@/cards/framework";
import type {AppState} from "@/app.state";

export function appPiInit(): void {
  registerFramework(SdFramework({page: "app/main", theme: "light"}));

  register((r) => {
    onPageWithNavbarNavigateTo(r, (state: AppState, {id}) => {
      state.currentPage = id;           // store active page in state
    });
  });

  registerCard("app/main", PageWithNavbar({
    title: "My App",
    navLinks: [
      {id: "home",     title: "Home"},
      {id: "settings", title: "Settings"},
    ],
    main: memo(
      (s: AppState) => s.currentPage ?? "home",
      (page) => `app/page/${page}`,     // resolves to "app/page/home" etc.
    ),
  }));

  registerCard("app/page/home",     /* … */);
  registerCard("app/page/settings", /* … */);
}
```

Add `currentPage?: string` to your `AppState` type:

```ts
// src/app.state.ts
export type AppState = ReduxState & {
  currentPage?: string;
  // … other fields
};
```

---

## `MarkdownViewer` — inline source vs. fetched path

The `markdownViewer` card accepts either an inline string or a URL:

```ts
// Inline markdown string
MarkdownViewer({source: "# Hello\nSome **markdown**."})

// Fetch from a URL (file must be accessible via HTTP)
MarkdownViewer({path: "/AGENT.md"})
```

When using `path`, the file must be reachable from the browser at that URL.
The recommended approach for project-root files (e.g. `AGENT.md`) is a small
**inline Vite plugin** in `vite.config.ts` — this avoids a stale copy in
`public/` and keeps a single source of truth:

```ts
// vite.config.ts
import {readFileSync} from "fs";
import type {Plugin} from "vite";

function rootFilePlugin(filenames: string[]): Plugin {
  return {
    name: "root-file-serve",
    // Dev: serve the file directly from the project root
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = filenames.find((f) => req.url === `/${f}`);
        if (name) {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(readFileSync(path.resolve(__dirname, name), "utf-8"));
          return;
        }
        next();
      });
    },
    // Build: emit the file into dist/ via Rollup
    generateBundle() {
      for (const name of filenames) {
        this.emitFile({
          type: "asset",
          fileName: name,
          source: readFileSync(path.resolve(__dirname, name), "utf-8"),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), rootFilePlugin(["AGENT.md"])],
  // …
});
```

Do **not** copy the file to `public/` manually — the plugin handles both dev
and production in one place.

---

## `registerFramework` — only one active at a time

Only one `registerFramework()` call may be active in a given app boot.  If you
compose multiple init functions (e.g. `appPiInit` calls `playgroundPiInit`),
ensure that only **one** of them calls `registerFramework`.

Remove or guard any `registerFramework` call in sub-inits before composing them:

```ts
// ❌ Both call registerFramework — second one silently wins (or errors)
const inits = [appPiInit, playgroundPiInit];

// ✅ appPiInit calls playgroundPiInit() internally after removing its
//    registerFramework call from playgroundPiInit.
export function appPiInit(): void {
  playgroundPiInit();               // no longer calls registerFramework
  registerFramework(SdFramework({page: "app/main", theme: "light"}));
  // …
}
```

---

## Card API quick reference — common naming gotchas

Several cards have prop or export names that differ from what you might intuit.
This table is a quick-lookup to avoid "card not found" or type-error surprises.

### `pi/button` — theming the `brand` variant

`variant="brand"` is intended for a visually prominent call-to-action button
that carries your app's brand colour.  Its out-of-the-box default is the
primary colour family — an intentional baseline; unlike other variants, it is
designed to be **rethemed with CSS only**, without touching any TypeScript.

The button's appearance is driven by three CSS tokens declared in the
`@theme inline` block of `src/index.css`:

| Token | Default | Controls |
|---|---|---|
| `--color-btn-brand` | `var(--primary)` | Background colour |
| `--color-btn-brand-foreground` | `var(--primary-foreground)` | Text / icon colour |
| `--radius-btn-brand` | `var(--radius-md)` | Border radius |

To apply your app's brand colour, add an `@theme inline` override **after**
the registry tokens in your `src/index.css`.  Tailwind v4 processes later
`@theme inline` blocks last, so your values silently win:

```css
/* src/index.css — app-level override */
@theme inline {
  --color-btn-brand:            oklch(0.78 0.18 85);  /* your brand colour */
  --color-btn-brand-foreground: oklch(0.15 0 0);      /* high-contrast foreground */
  --radius-btn-brand:           9999px;               /* pill shape */
}
```

Usage in `app.pihanga.ts` is unchanged:

```ts
import {Button} from "@/cards/button";

registerCard("myApp/cta", Button({
  label: "Get started",
  opts:  {variant: "brand"},
}));
```

> **Why token indirection?**  Hard-coding a brand colour directly into the CVA
> string would couple every consumer of the registry to a specific palette.
> Routing through `--color-btn-brand` means any app can retheme the `brand`
> variant in CSS alone.  The pattern can be extended to any other variant that
> needs per-app theming.

### `pi/button` — rendering as an anchor / link

> ⚠️ **Do NOT write a separate local link-button card.**  The `pi/button` card
> already renders as an `<a>` element when `href` is provided.

Pass `href` (and optionally `target`) directly to `Button(…)`:

```ts
registerCard("myApp/docsLink", Button({
  label:  "Documentation",
  href:   "https://example.com/docs",
  target: "_blank",          // open in new tab
  opts:   {variant: "outline"},
}));
```

When `href` is set the card renders an `<a>` tag styled identically to the
`<button>` variant.  The `onClicked` event still fires (via `e.preventDefault()`
internally), so Pihanga event handlers work as usual if you also need to react
to the click in Redux.

| Prop | Type | Purpose |
|---|---|---|
| `href` | `string` | Destination URL; presence switches element to `<a>` |
| `target` | `string` | e.g. `"_blank"` for new tab; passed straight to `<a target>` |

### `shad/tabs` — import `SdTabs`, not `Tabs`

```ts
// ✅ Correct
import {SdTabs, onTabsTabChanged} from "@/cards/tabs";
import type {TabsProps} from "@/cards/tabs";

registerCard("myApp/tabs", SdTabs({
  value:       memo((s: AppState) => s.activeTab),   // ← "value", NOT "activeTab"
  tabs: [
    {id: "a", title: "Panel A", contentCard: "myApp/panelA"},  // ← "title" + "contentCard"
    {id: "b", title: "Panel B", contentCard: "myApp/panelB"},
  ],
}));
```

| What you might write | Actual prop / export |
|---|---|
| `Tabs({…})` | `SdTabs({…})` |
| `activeTab: …` | `value: …` |
| `tab.label` | `tab.title` |
| `tab.content` | `tab.contentCard` |

The `shad/tabs` card also supports `selfManaged: true` for cases where you do
**not** want to store the active tab in Redux — the component manages its own
state internally, but still dispatches `onTabChanged` so reducers can observe.

```ts
// Self-managed — no reducer needed:
registerCard("myApp/tabs", SdTabs({
  selfManaged: true,
  tabs: [{id: "a", title: "A", contentCard: "myApp/panelA"}],
}));
```

### `shad/tabs` — `tab.title` strings are always rendered as text, not card IDs

When `tab.title` is a plain `string`, it is **always rendered as literal text**
on the tab trigger — even if the string happens to be a registered card name.
To mount a card inside the tab trigger, use an **object-form card declaration**:

```ts
import {SdBadge} from "@/cards/badge";

registerCard("myApp/tabs", SdTabs({
  tabs: [
    // ✅ String label — rendered as tab text
    {id: "home",     title: "Home",                    contentCard: "myApp/home"},

    // ✅ Object card declaration — card is mounted inside the tab trigger
    {id: "alerts",   title: SdBadge({label: "3", variant: "destructive"}),
                     contentCard: "myApp/alerts"},

    // ❌ String card ID — NOT mounted; "myApp/badgeCard" appears as literal text
    {id: "settings", title: "myApp/badgeCard",          contentCard: "myApp/settings"},
  ],
}));
```

**Why?** The component uses `typeof tab.title !== "string"` to distinguish plain
labels from object card declarations.  `isCardRef()` from `@pihanga2/core` does
not recognise plain-string card IDs — only object-form `PiCardDef` values — so
the `typeof` guard is the correct approach.  A string `title` is therefore
unambiguously a label, regardless of whether it looks like a card path.

### `pi/input` — the labeled, **controlled** standalone text input

**`pi/input`** in this library is a fully-controlled labeled text input that
can bind to Redux state, mask passwords, and fire per-keystroke or commit events.
It supersedes the uncontrolled `Input` from the deprecated `@pihanga2/cards`
package, which had no `value` prop and no `type` prop.

| Feature | `pi/input` (this library) |
|---|---|
| `value` prop (Redux binding) | ✓ |
| `type` prop (`password`, `email`, …) | ✓ |
| `onChanged` (per-keystroke) | ✓ |
| `onCommitted` (blur / Enter) | ✓ |
| `label` + `description` | ✓ |
| Works inside `pi/form` / `pi/field` | ✓ |

The card you want for a freestanding labeled input (e.g. a JWT token field, a
search box, a settings field) is **`pi/input`** — *not* `pi/text-input`, which
does not exist.  You do **not** need to write your own local card.

```ts
import {PiInput, onPiInputChanged} from "@/cards/input";
import type {AppState} from "@/app.state";

register((r) => {
  onPiInputChanged(r, (state: AppState, {value}) => {
    state.jwtToken = value;
  });
});

registerCard("myApp/jwtField", PiInput({
  label:       "JWT token",
  value:       memo((s: AppState) => s.jwtToken),   // ← bound to Redux state
  placeholder: "Paste your bearer token here…",
  type:        "password",                           // ← masks as ••••
  className:   "flex-1",
}));
```

`pi/input` also fires `onCommitted` (blur / Enter) for cases where you only
want to react once per editing session rather than on every keystroke.

> **`pi/text-field`** (`TextField`) is a *different* card — it is designed to
> live *inside* a `pi/field` + `pi/form` composition and reads its value from
> form context.  Use `pi/input` for standalone labeled inputs.

### `shad/loading-skeleton` — prefer named presets over raw Tailwind

The card has built-in named presets so you rarely need raw Tailwind classes:

```ts
import {LoadingSkeleton} from "@/cards/loadingSkeleton";

registerCard("myApp/area", LoadingSkeleton({
  loading:  memo((s: AppState) => s.dataLoading),
  rows:     4,
  rowSize:  "lg",     // ← xs | sm | md (default) | lg | xl
  spacing:  "lg",     // ← sm | md (default) | lg
  content:  "myApp/dataList",
}));
```

Raw `rowClassName` / `className` overrides are available as escape hatches for
custom layouts, but the presets handle the common cases without any Tailwind
knowledge.

### `shad/conditional` — mount/unmount a card based on state

```ts
import {Conditional} from "@/cards/conditional";

registerCard("myApp/hint", Conditional({
  show:    memo((s: AppState) => s.items.length === 0 && !s.isLoading),
  content: "myApp/emptyStateHint",
}));
```

This is a transparent pass-through — no extra DOM wrapper is added.  Prefer
it over `className: (s) => s.x ? "" : "hidden"` workarounds.

### `shad/framework` — default theme is `"dark"`

> ⚠️ **Do NOT assume the default theme is `"light"` or `"system"`.** The
> `framework` card defaults to `theme: "dark"` when no `theme` prop is provided.

The `theme` prop is passed to `ThemeProvider` and persisted in `localStorage`
under the key `"shadcn-ui-theme"`.  Override it explicitly if your app needs
a different default:

```ts
// Dark (default — no explicit prop needed):
registerFramework(SdFramework({page: "app/main"}));

// Light on first load:
registerFramework(SdFramework({page: "app/main", theme: "light"}));

// Follow the OS preference:
registerFramework(SdFramework({page: "app/main", theme: "system"}));
```

The `modeToggle` card switches between `"light"` and `"dark"` at runtime and
persists the new preference.  Once the user has toggled, the stored
`localStorage` value takes over from the `theme` default.

### `shad/list` — icon decorators require registered icons

The `shad/list` card supports an `"icon"` decorator type on list items.  When
a list item specifies `decorator: {type: "icon", name: "someIcon"}`, the
component calls `getIcon(name)` from `src/cards/icons.ts` to resolve the icon.

> ⚠️ **Icons must be registered before they can appear in list item decorators.**
> This dependency is NOT visible from the card's type declarations — an
> unregistered icon name silently renders nothing.

Register icons in `src/cards/icons.ts` (or your app's icon registry file):

```ts
// src/cards/icons.ts  (or your project's equivalent)
import {registerIcon} from "@/cards/icons";
import {CheckCircle, AlertCircle, Info} from "lucide-react";

registerIcon("check-circle", CheckCircle);
registerIcon("alert",        AlertCircle);
registerIcon("info",         Info);
```

Then use the registered name in list item decorators:

```ts
import {ShadList} from "@/cards/list";

registerCard("myApp/statusList", ShadList({
  items: [
    {
      id: "1",
      title: "Job complete",
      decorator: {type: "icon", name: "check-circle"},   // ← registered name
    },
  ],
}));
```

If the icon name is not registered, the decorator slot renders as empty with no
error in the console — making the omission easy to miss.

---

## Known gaps identified during AI agent evaluations

### 2026-04 evaluation — multi-page app task

The following patterns were **not** documented in the original AGENT.md but were
required to complete a multi-page app task.  They have been added above.

| Gap | Section now added |
|-----|-------------------|
| App bootstrap pattern (`registerFramework` / `start`) | *Bootstrapping a pihanga app* |
| `memo()` for reactive state-driven props | *`memo()` — reactive state-driven props* |
| Multi-page navigation with `PageWithNavbar` + `onPageWithNavbarNavigateTo` | *Multi-page navigation with `PageWithNavbar`* |
| `MarkdownViewer` `path` prop requires HTTP access / `public/` | *`MarkdownViewer` — inline source vs. fetched path* |
| `registerFramework` uniqueness constraint when composing inits | *`registerFramework` — only one active at a time* |
| `AppState` must be extended for new state fields | *Multi-page navigation* (see `currentPage` example) |

### 2026-06 evaluation — card-composition data-fetch app (`@pihanga/ivcap`)

An agent built a pure-card-composition data-fetch app and reported several cards
as "missing".  Post-mortem: the cards existed but had non-obvious API names or
were absent from the available-cards table.  The following fixes were applied:

| Reported gap | Reality | Fix applied |
|---|---|---|
| `shad/loading-skeleton` not found | Card exists; uses `rowSize`/`spacing` presets, not raw `rowClassName` | Added to available-cards table; added to *Card API quick reference* |
| `shad/conditional` not found | Card exists and is straightforward | Added to available-cards table; added to *Card API quick reference* |
| `pi/text-input` card missing | Card exists as **`pi/input`** (`PiInput` export) | Added `pi/input` guidance to *Card API quick reference* |
| `pi/tabs` card missing | Card exists as **`shad/tabs`** (`SdTabs` export); `value` not `activeTab`; `contentCard` not `content`; `title` not `label` | Added tabs guidance to *Card API quick reference* |
| Dialog invisible on dark theme | `bg-background` made modal panel near-black on dark themes | Fixed `dialog.tsx`: `bg-card text-card-foreground border border-border shadow-xl` |

### 2026-06 developer report — app team wrote a local `pi/text-input` card

A developer building an app on top of this library wrote and kept their own
local `pi/text-input` card, reasoning that the deprecated `@pihanga2/cards`
Input is uncontrolled (no `value` prop, no `type` prop) and therefore
unsuitable for Redux binding or password masking.

**Reality:** `pi/input` in *this* library (`pihanga-shadcn`) is already a fully
controlled replacement.  It has `value`, `type`, `onChanged`, `onCommitted`,
label, description, and `pi/form` integration.  The developer did not need a
local card.

| Root cause | Fix applied |
|---|---|
| `pi/input` section did not explicitly contrast itself with `@pihanga2/cards`' uncontrolled `Input` | Added feature-comparison table and "you do **not** need to write your own local card" callout to *Card API quick reference → `pi/input`* |

### 2026-06 developer report — CSS setup pitfalls with Tailwind v4 + Dialog

Two CSS issues were observed when integrating the library into a Tailwind v4
project that was bootstrapped without the reference `index.css`:

| Symptom | Root cause | Fix |
|---|---|---|
| Dialog panel, cards, popovers appear **invisible** (no background colour) | Tailwind v4 does not auto-generate colour utilities from raw CSS variables — the `@theme inline` block bridging `--card` → `--color-card` etc. was absent | Add the full `@theme inline` block to `src/index.css` (see *Prerequisites → Configure `src/index.css`*) |
| Page content **reflows** (text re-wraps) when a dialog opens | Radix UI's `@radix-ui/react-remove-scroll` applies `overflow: hidden` to `<body>` on dialog open, removing the scrollbar and widening the layout by ~15 px | Add `scrollbar-gutter: stable` to `body` in `src/index.css` (see *Prerequisites → Configure `src/index.css`*) |

Both fixes are now included in the reference `src/index.css` template in
*Prerequisites step 3*.

### 2026-06 agent evaluation — ViteJS app from scratch (BuhlOS-2)

An agent built a new ViteJS + React + TypeScript app from scratch using
`yarn create vite` and then manually copied pihanga-shadcn cards.  The
following blockers were hit that were not covered by any existing doc section.
All fixes have been added to the new *[Vite configuration (both channels)](#vite-configuration-both-channels)* section.

| Blocker | Root cause | Fix |
|---|---|---|
| `"Failed to resolve import '@/registry/ui/button'"` | The `@/registry` → `src/components` Vite alias was not documented | Added required `vite.config.ts` alias table |
| `"Failed to resolve import '@/components/lib/utils'"` | shadcn UI components import `cn()` from `@/components/lib/utils`, not `@/lib/utils`; the file must exist at both paths | Added `src/components/lib/utils.ts` creation step |
| `SyntaxError: does not provide an export named 'PiCardRef'` | Card source files (button.types.ts, toast.types.ts, typography.types.ts) imported `PiCardRef` without the `type` keyword; esbuild doesn't enforce `verbatimModuleSyntax` | Added **Type-only import gotcha** section with before/after examples |
| `SyntaxError: does not provide an export named 'Store'` | `app.root.tsx` imported `Store` from `@reduxjs/toolkit` as a value | Covered by same type-only import section |
| Vite `"Failed to resolve import '@/cards/dropDownMenu/dropdown-context'"` | `button` card has a transitive dependency on `dropDownMenu` that isn't obvious | Added **Transitive card dependencies** table |
| `pageWithNavbar` missing internal helpers at runtime | `pageWithNavbar` has transitive dependencies on `modeToggle`, `navbarSearch`, and `toast` | Added to transitive dependencies table |
| `@pihanga2/cards` not in package.json | `shad/stack` previously imported `StackProps` from `@pihanga2/cards` | **`@pihanga2/cards` is now deprecated.** `BoxProps` and `StackProps` are defined locally in `box.types.ts` / `stack.types.ts`. Do **not** install `@pihanga2/cards`. |

### 2026-06 app developer wrote a local link-button card

A developer building an app with `pi/button` wrote a separate local card for
anchor-style buttons, believing that `pi/button` only rendered `<button>`
elements and had no link capability.

**Reality:** `pi/button` already renders as an `<a>` element when the `href`
prop is provided (see *Card API quick reference → `pi/button` — rendering as
an anchor / link*).  No local card was needed.

| Root cause | Fix applied |
|---|---|
| `href` / `target` props on `pi/button` existed in `button.types.ts` but were never documented in any guide or quick-reference section | Added `pi/button — rendering as an anchor / link` section to *Card API quick reference* in `AGENT.using-cards.md` and a matching `### Button as an anchor link` subsection to `USER_GUIDE.md` |

### 2026-06 app developer findings — hidden contracts and misunderstood defaults

An app team building on pihanga-shadcn documented several card behaviours that
they had to discover by reading source, along with two cases where they made
local modifications to the registry code for features that already existed.

| Reported issue | Reality | Fix applied |
|---|---|---|
| `shad/framework` defaults to `"light"` or `"system"` — team patched it to `"dark"` | The registry already defaults to `theme: "dark"`; no patch was needed | Added *`shad/framework` — default theme is `"dark"`* to *Card API quick reference* |
| `shad/tabs` with a string card ID as `tab.title` rendered the raw ID string instead of mounting the card | This is intended behaviour: strings are always text labels; only object-form declarations mount as cards; `isCardRef()` cannot reliably identify string card IDs | Added *`shad/tabs` — `tab.title` strings are always rendered as text* to *Card API quick reference* with correct object-form pattern |
| `shad/list` icon decorators silently rendered nothing when icon names were unregistered | The `shad/list` card calls `getIcon(name)` which requires icons to be pre-registered via `registerIcon()` in `src/cards/icons.ts`; this contract is not visible in the type declarations | Added *`shad/list` — icon decorators require registered icons* to *Card API quick reference* |
| `flexGrid.component.tsx` failed to compile under `verbatimModuleSyntax` / `noImplicitAny` strict TypeScript | Registry source mixed value and type imports; had implicit `any` in `.map()` callback; `Object.entries` lacked an explicit cast; `_style` lacked widened type for `gridTemplateAreas` | Fixed directly in `flexGrid.component.tsx`: split `import type`, added explicit `row: string[]` annotation, added `as [string, PiCardRef][]` cast, widened `_style` type |
| `stack.component.tsx` contained commented-out Joy UI dead code | Leftover from a previous MUI Joy UI implementation; the current Tailwind implementation is complete and the comment block serves no purpose | Removed the dead code block |

### 2026-06 user feedback — `npx shadcn@latest add` fails on npm 11 + Node 24

Users reported that every `npx shadcn@latest` command failed with
`npm error could not determine executable to run` when running Node 24 (which
bundles npm 11).  The docs only showed `npx` examples with no mention of a
yarn alternative or Node version constraint.

| Reported gap | Fix applied |
|---|---|
| No `yarn dlx` alternative documented | Added `yarn dlx shadcn@latest` as the yarn-compatible alternative in the distribution channels table, Channel 1 init step, and "Adding individual cards" commands |
| No warning about npm 11 + Node 24 incompatibility | Added a prominent compatibility callout at the top of *Channel 1 — shadcn registry prerequisites*, with the `nvm use 22` workaround and the `yarn dlx` alternative |
| "Notes for AI agents" section did not mention the `npx` breakage | Added a bullet noting that `npx` fails on npm 11 + Node 24 and that `yarn dlx shadcn@latest` is a drop-in replacement |
