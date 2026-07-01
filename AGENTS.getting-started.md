# AGENTS.getting-started.md — setting up a new Pihanga + shadcn/ui app

> **Scope:** creating a brand-new project from scratch — build tool, shadcn/ui,
> pihanga-core, and an initial file layout.
> Read [`AGENT.md`](./AGENT.md) first for orientation.
> Once your project is bootstrapped, continue with
> [`AGENT.using-cards.md`](./AGENT.using-cards.md) to install and wire cards.

> 💬 **Stuck, found a bug, or have a suggestion?**
> Please open an issue at **https://github.com/ivcap-works/pihanga-shadcn/issues**

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1 — Create a new Vite + React + TypeScript project](#step-1--create-a-new-vite--react--typescript-project)
- [Step 2 — Install shadcn/ui](#step-2--install-shadcnui)
  - [⚠️ npx compatibility: npm 11 + Node 24](#️-npx-compatibility-npm-11--node-24)
  - [Run shadcn init](#run-shadcn-init)
  - [Configure `src/index.css` (Tailwind v4 + shadcn theme)](#configure-srcindexcss-tailwind-v4--shadcn-theme)
  - [Add the required `src/components/lib/utils.ts`](#add-the-required-srccomponentslibutils-ts)
- [Step 3 — Install pihanga-core](#step-3--install-pihanga-core)
- [Step 4 — Install pihanga-shadcn cards](#step-4--install-pihanga-shadcn-cards)
  - [Option A — shadcn registry (copy-on-install)](#option-a--shadcn-registry-copy-on-install)
  - [Option B — npm package](#option-b--npm-package)
- [Step 5 — Configure Vite aliases](#step-5--configure-vite-aliases)
- [Step 6 — Suggested file layout](#step-6--suggested-file-layout)
  - [`src/app.types.ts` — app-wide type definitions](#srcapptypests--app-wide-type-definitions)
  - [`src/app.state.ts` — Redux state shape](#srcappstatetsts--redux-state-shape)
  - [`src/app.pihanga.ts` — UI declaration](#srcapppihangats--ui-declaration)
  - [`src/app.reducer.ts` — external event handlers](#srcappreducerts--external-event-handlers)
  - [`src/main.ts` — entry point](#srcmaints--entry-point)
- [Putting it all together — minimal working app](#putting-it-all-together--minimal-working-app)
- [Next steps](#next-steps)

---

## Prerequisites

| Tool | Minimum version | Notes |
|---|---|---|
| **Node.js** | 18 LTS (22 recommended) | Node 24 has a known `npx` bug — use 22 if you use `npx` |
| **Package manager** | npm 9 / yarn 1.22 / pnpm 8 | yarn or pnpm recommended |
| **Git** | any | |

> **Node version tip:** use [nvm](https://github.com/nvm-sh/nvm) to switch
> between versions without affecting your system install.
>
> ```sh
> nvm install 22
> nvm use 22
> ```

---

## Step 1 — Create a new Vite + React + TypeScript project

The recommended build environment for pihanga-shadcn apps is **Vite**.
It is fast, supports HMR, and integrates cleanly with Tailwind v4 and shadcn/ui.

```sh
# npm
npm create vite@latest my-app -- --template react-ts

# yarn
yarn create vite my-app --template react-ts

# pnpm
pnpm create vite my-app --template react-ts
```

Then enter the project and install dependencies:

```sh
cd my-app
npm install   # or: yarn / pnpm install
```

> **Other build tools:** shadcn/ui supports Next.js, Remix, Astro, and Laravel
> in addition to Vite — see https://ui.shadcn.com/docs/installation for those
> setup paths.  The rest of this guide assumes Vite.

---

## Step 2 — Install shadcn/ui

### ⚠️ npx compatibility: npm 11 + Node 24

`npx shadcn@latest` is known to fail with **npm 11** (which ships with Node 24)
due to a breaking change in how `npx` resolves packages.  If you see:

```
npm error could not determine executable to run
```

Use one of the following alternatives:

```sh
# npm exec — works with npm 9+ including npm 11 on Node 24
npm exec shadcn@latest -- init

# yarn dlx — Yarn 2+ (Berry) ONLY; does NOT work with Yarn 1.x (Classic)
yarn dlx shadcn@latest init

# nvm switch to Node 22 so npx works normally
nvm install 22 && nvm use 22
npx shadcn@latest init
```

> **Note:** `yarn dlx` is only available in **Yarn 2+ (Berry)**.  If you are
> using Yarn 1.x (Classic), use `npm exec shadcn@latest -- init` instead.
> Running `yarn dlx` on Yarn 1.x produces `error Command "dlx" not found.`

### Run shadcn init

```sh
# npm / npx (Node 22 recommended)
npx shadcn@latest init

# npm exec (npm 9+, including npm 11 on Node 24)
npm exec shadcn@latest -- init

# yarn dlx (Yarn 2+ / Berry only)
yarn dlx shadcn@latest init
```

When prompted:

| Prompt | Choose |
|---|---|
| **Style** | New York |
| **Base colour** | Neutral |
| **CSS variables** | Yes |

`shadcn init` will:
- Create `components.json` (shadcn configuration)
- Patch `tsconfig.json` with the `@/` path alias (`@/* → ./src/*`)
- Install Tailwind CSS v4 and required peer packages

After init, verify `tsconfig.json` contains:

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

The `@/*` → `./src/*` mapping already covers `@/cards/` → `src/cards/`, so no
extra alias is needed as long as cards are placed under `src/cards/`.

### Configure `src/index.css` (Tailwind v4 + shadcn theme)

> ⚠️ **Tailwind v4 requires an explicit `@theme inline` block.**  Without it,
> classes like `bg-card`, `bg-background`, and `border-border` render as
> **transparent** — causing dialog panels, popovers, and cards to appear
> invisible.  This is a very common first-time gotcha.

> ⚠️ **`@source` is required for `@pihanga2/shadcn` cards to be styled.**
> Tailwind v4 uses static source scanning — it only emits CSS for classes it
> finds in scanned files.  Without an `@source` directive pointing at the
> pihanga-shadcn package, every Tailwind class used inside card components
> (flex layouts, button sizing, spacing, colours, etc.) is **stripped from the
> CSS bundle**.  The visual result is that all card components render with no
> styling whatsoever — buttons appear unstyled, layouts collapse — yet **no
> error is produced**.  This is a completely silent failure that is very hard
> to diagnose.
>
> The correct `@source` path depends on which installation channel you used:
>
> ```css
> /* npm channel — @pihanga2/shadcn installed via yarn/npm */
> @source "../node_modules/@pihanga2/shadcn/cards";
> @source "../node_modules/@pihanga2/shadcn/components";
>
> /* registry / monorepo channel — local copy of pihanga-shadcn */
> @source "../node_modules/@pihanga2/shadcn/dist-lib";
> ```
>
> Note: `dist-lib/` is the compiled library output produced by the
> pihanga-shadcn build (`vite build --config vite.lib.config.ts`).  It exists
> in the git repository but **is not included in the published npm package**.
> Using the `dist-lib` path with the npm channel causes Tailwind to silently
> find no files.  Always use the `cards/` + `components/` paths for npm installs.

> ⚠️ **Do not let your IDE formatter rewrite `@import "tailwindcss"`.**
> Some CSS formatters (VS Code's built-in formatter, Prettier's CSS mode) do
> not recognise `@import "tailwindcss"` as valid CSS and may silently strip the
> `@`, transforming it to `import "tailwindcss"`.  This immediately breaks
> Tailwind v4 processing and produces the cryptic error:
>
> ```
> Internal server error: Invalid declaration: `import "tailwindcss"`
> ```
>
> The `@` is critical — it is Tailwind's own CSS `@import` directive, not a
> standard CSS import.  If you use format-on-save, either disable it for
> `src/index.css` or add `/* stylelint-disable */` as the very first line.

Replace the contents of `src/index.css` with the following (you can also copy
it directly from the repo at
`https://raw.githubusercontent.com/ivcap-works/pihanga-shadcn/main/src/index.css`):

```css
/* stylelint-disable */
@import "tailwindcss";

/*
 * Point Tailwind at the pihanga-shadcn package so it scans card classes.
 * Without this, ALL Tailwind classes used inside @pihanga2/shadcn card components
 * are stripped from the CSS output — buttons appear unstyled, layouts collapse.
 *
 * Use the paths that match your installation channel (see guide):
 */

/* npm channel (@pihanga2/shadcn installed via yarn/npm) */
@source "../node_modules/@pihanga2/shadcn/cards";
@source "../node_modules/@pihanga2/shadcn/components";

/* registry / monorepo channel (uncomment and remove the two lines above) */
/* @source "../node_modules/@pihanga2/shadcn/dist-lib"; */

/*
 * Tailwind v4 — map shadcn semantic CSS variables to Tailwind colour utilities.
 * Without this @theme block, classes like bg-card / bg-background / border-border
 * have no associated colour and render as transparent.
 */
@theme inline {
  /*
   * Brand button tokens — override these in your app to retheme variant="brand".
   * Defaults to the primary colour family.
   */
  --color-btn-brand: var(--primary);
  --color-btn-brand-foreground: var(--primary-foreground);
  --radius-btn-brand: var(--radius-md);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

/* ── Light theme (shadcn neutral / new-york) ─────────────────────────────── */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}

/* ── Dark theme ──────────────────────────────────────────────────────────── */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
    /*
     * Prevent layout reflow when a Radix dialog applies `overflow: hidden`
     * to <body>.  Without this, removing the scrollbar widens the content
     * area by ~15 px and causes visible text reflow behind the backdrop.
     */
    scrollbar-gutter: stable;
  }
}
```

> **Why `@theme inline`?**  Tailwind v4 separates design tokens from utility
> generation.  shadcn stores colours as CSS custom properties (`--card`, etc.)
> but Tailwind v4 won't generate colour utilities from raw CSS variables unless
> they're declared inside an `@theme` block.

> **Why `scrollbar-gutter: stable`?**  When a Radix dialog opens,
> `@radix-ui/react-remove-scroll` sets `overflow: hidden` on `<body>` which
> hides the scrollbar and adds ~15 px to the layout — causing text reflow.
> `scrollbar-gutter: stable` reserves a permanent gutter so this never happens.

### Add the required `src/components/lib/utils.ts`

All shadcn UI components import the `cn()` helper from
`@/components/lib/utils` (not from `@/lib/utils`).  Create this file:

```ts
// src/components/lib/utils.ts
import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

> **Note:** `@/lib/utils.ts` can also exist for app-level utilities — the two
> files live at different paths and serve different audiences.

---

## Step 3 — Install pihanga-core

[pihanga-core](https://github.com/ivcap-works/pihanga-core) is the declarative
card framework + Redux store that underpins all pihanga-shadcn cards.

```sh
npm install @pihanga2/core
# or: yarn add @pihanga2/core  /  pnpm add @pihanga2/core
```

`@pihanga2/core` provides:

| Export | Purpose |
|---|---|
| `start(state, inits, opts)` | Boot the app — creates the Redux store and mounts React |
| `registerFramework(card)` | Set the single root framework card (call **once** per app) |
| `registerCard(id, card)` | Register a named card so others can reference it by id |
| `register(r => { … })` | Register global event handlers / reducers |
| `memo(selector, mapper)` | Make any card prop reactive to Redux state |
| `DEFAULT_REDUX_STATE` | Empty initial Redux state object |

---

## Step 4 — Install pihanga-shadcn cards

There are two independent distribution channels.  Pick **one**.

### Option A — shadcn registry (copy-on-install)

Cards are copied as editable TypeScript source into your project.
Use this when you want to customise card source, or when you're already on shadcn/ui.

```sh
# Add individual cards (npm/npx, Node 22 recommended)
npx shadcn@latest add https://ivcap-works.github.io/pihanga-shadcn/r/framework.json
npx shadcn@latest add https://ivcap-works.github.io/pihanga-shadcn/r/button.json
npx shadcn@latest add https://ivcap-works.github.io/pihanga-shadcn/r/pageWithNavbar.json

# Same commands with yarn dlx (works on all Node versions)
yarn dlx shadcn@latest add https://ivcap-works.github.io/pihanga-shadcn/r/framework.json
yarn dlx shadcn@latest add https://ivcap-works.github.io/pihanga-shadcn/r/button.json
```

Cards land at `src/cards/<card-name>/`.  The shadcn CLI also installs
`@pihanga2/core` and any card-specific npm packages automatically.

**Always add `framework` first** — it is the Pihanga app root card.

Registry base URL: `https://ivcap-works.github.io/pihanga-shadcn/r`

### Option B — npm package

Use this for monorepos, CI, or when a clean `npm install` workflow is preferred.
No `shadcn init` required.

```sh
npm install @pihanga2/shadcn
# or: yarn add @pihanga2/shadcn  /  pnpm add @pihanga2/shadcn
```

Add `@source` to `src/index.css` so Tailwind can scan the package for classes
(see the Step 2 index.css section for full context):

```css
/* src/index.css — add after @import "tailwindcss" */
@source "../node_modules/@pihanga2/shadcn/cards";
@source "../node_modules/@pihanga2/shadcn/components";
```

> **Why `cards/` and `components/`?**  `dist-lib/` is the compiled library
> output that exists only in the pihanga-shadcn git repository — it is **not**
> included in the published npm package.  The `cards/` directory contains
> compiled JS for each card component (with Tailwind class strings like
> `"flex"`, `"flex-row"`, `"items-center"`), and `components/ui/` contains the
> shadcn UI primitives.  Using `dist-lib` with the npm channel causes Tailwind
> to silently find no files.

Activate cards in your entry point:

```ts
// Activate all 30 core cards at once
import "@pihanga2/shadcn";

// OR activate only what you need (tree-shakeable)
import "@pihanga2/shadcn/cards/framework";
import "@pihanga2/shadcn/cards/button";
import "@pihanga2/shadcn/cards/pageWithNavbar";
```

> **Cards not in the npm package** (registry-only due to heavy deps):
> `graphin`, `jsonViewer`, `markdownViewer`, `resizable`.

---

## Step 5 — Configure Vite aliases

pihanga-shadcn cards reference each other and shadcn UI primitives via path
aliases.  Without these, you'll see cryptic errors like:
`Failed to resolve import '@/registry/ui/button'`.

Replace or extend your `vite.config.ts`:

```ts
// vite.config.ts
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      // @/lib  →  src/lib  (shared utilities)
      {find: "@/lib",        replacement: path.resolve(__dirname, "./src/lib")},
      // @/registry  →  src/components  (shadcn UI primitives)
      //   Cards import via "@/registry/ui/button" etc.
      {find: "@/registry",   replacement: path.resolve(__dirname, "./src/components")},
      // @/components  →  src/components  (cross-component imports)
      {find: "@/components", replacement: path.resolve(__dirname, "./src/components")},
      // @/cards  →  src/cards  (card-to-card imports)
      {find: "@/cards",      replacement: path.resolve(__dirname, "./src/cards")},
      // @  →  src  (catch-all for everything else)
      {find: "@",            replacement: path.resolve(__dirname, "./src")},
    ],
    // Prevent React and Redux from being duplicated across packages.
    dedupe: ["react", "react-dom", "react-redux"],
  },
  optimizeDeps: {
    // ⚠️ npm channel users: exclude @pihanga2/core AND @pihanga2/shadcn from
    // Vite's esbuild pre-bundler.  Both packages share a module-level card
    // registry.  If either is pre-bundled, @pihanga2/core gets inlined into a
    // separate chunk — creating two registry instances and causing
    // "Unknown card '...'" errors at runtime.
    //
    // By excluding both, Vite serves them as raw ES modules.  The browser's
    // module cache deduplicates by URL, so all imports share one instance.
    //
    // CJS packages used transitively by @pihanga2/core must still be listed in
    // `include` so Vite can convert them to ESM for the browser.
    exclude: ["@pihanga2/core", "@pihanga2/shadcn"],
    include: ["deep-equal", "stacktrace-js", "react-dom/client"],
  },
});
```

> **Registry channel users** — if you installed cards via `npx shadcn add`
> (Option A), the `optimizeDeps` block is not needed because cards live as
> local source files rather than npm packages.

Also verify your `tsconfig.json` has the full set of path aliases that match
the `vite.config.ts` above (shadcn init only adds `@/*`; add the rest manually):

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@/*":          ["./src/*"],
      "@/lib/*":      ["./src/lib/*"],
      "@/components/*": ["./src/components/*"],
      "@/registry/*": ["./src/components/*"],
      "@/cards/*":    ["./src/cards/*"]
    }
  }
}
```

> ⚠️ **TypeScript ≥ 6.0: `baseUrl` deprecation error.**
> `shadcn init` may inject `"baseUrl": "."` into `tsconfig.json` alongside
> the `paths` block.  On TypeScript ≥ 6.0 (which ships with Node 24's
> toolchain) this causes a hard build error:
>
> ```
> error TS5101: Option 'baseUrl' is deprecated and will stop functioning in
> TypeScript 7.0. Specify compilerOption '"ignoreDeprecations": "6.0"' to
> silence this error.
> ```
>
> This blocks `tsc -b` and therefore `yarn/npm build` entirely.  Two remedies:
>
> **Option 1 — add `ignoreDeprecations`** (minimal change):
> ```jsonc
> {
>   "compilerOptions": {
>     "ignoreDeprecations": "6.0",  // required on TypeScript ≥ 6.0
>     "baseUrl": ".",
>     "paths": { /* ... */ }
>   }
> }
> ```
>
> **Option 2 — remove `baseUrl` entirely** (preferred): with
> `"moduleResolution": "bundler"`, TypeScript resolves `paths` entries
> relative to the config file by default, so `"baseUrl": "."` is redundant.
> Simply delete the `"baseUrl"` line and the error disappears without any
> other changes.

---

## Step 6 — Suggested file layout

A minimal Pihanga app needs five source files in addition to the shadcn and
card files that shadcn installs:

```
src/
├── app.types.ts        ← app-wide type definitions (errors, etc.)
├── app.state.ts        ← TypeScript type for the full Redux state
├── app.pihanga.ts      ← declarative UI — registerFramework / registerCard calls
├── app.reducer.ts      ← external event handlers (register() + on* helpers)
├── app.root.tsx        ← Redux Provider + Toaster wrapper (copy from repo)
├── main.ts             ← entry point — calls start() to boot the app
├── index.css           ← Tailwind + shadcn theme (created above)
├── cards/              ← cards installed by shadcn CLI (registry channel)
│   └── framework/
│   └── button/
│   └── …
└── components/         ← shadcn UI primitives (managed by shadcn CLI — do not edit)
    └── ui/
    └── lib/
        └── utils.ts    ← cn() helper (created above)
```

> **`src/app.root.tsx`** — copy this file from
> [`example/src/app.root.tsx`](https://github.com/ivcap-works/pihanga-shadcn/blob/main/example/src/app.root.tsx)
> in the pihanga-shadcn repository.  It wires the Redux `<Provider>` and
> Sonner `<Toaster>` around the Pihanga card tree.

### `src/app.types.ts` — app-wide type definitions

Define shared types referenced across your app.  At minimum, keep a standard
error envelope here so any async action that can fail has a uniform shape.
Add domain types (entities, enums, etc.) as the app grows.

```ts
// src/app.types.ts
import type {ReduxAction, ReplyAction} from "@pihanga2/core";

/**
 * Standard error envelope — attach to any async action that can fail.
 */
export type ErrorEvent = {
  message: string;
  source: string;
  cause: unknown;
  requestAction: ReduxAction;
};

export type ErrorAction = ReplyAction & ErrorEvent;
```

### `src/app.state.ts` — Redux state shape

`AppState` extends pihanga-core's `ReduxState` with your own domain fields.
All state is managed by Immer-powered reducers — mutate the draft directly
inside `register()` callbacks; Immer handles immutability for you.

The example below is a **counter** app — the simplest possible state.  Replace
`count` with whatever your domain needs.

```ts
// src/app.state.ts
import type {ReduxState} from "@pihanga2/core";

/**
 * Application state — extends pihanga-core's base Redux state.
 * All state is managed by Immer-powered reducers registered in
 * app.pihanga.ts (inline) or app.reducer.ts (external).
 */
export type AppState = ReduxState & {
  /** The current counter value. */
  count: number;

  // Add your own domain fields here, e.g.:
  // currentPage?: string;
  // userId?: string;
};
```

### `src/app.pihanga.ts` — UI declaration

This is the heart of a Pihanga app.  Instead of JSX components, you declare
the UI as a tree of named cards.  State flows into cards via prop selectors;
user interactions flow out via `register()` / inline `on*` handlers.

Two patterns for handling card events are shown side-by-side here:

- **Inline `onClicked`** — scoped directly to the anonymous `[−]` button.
  Use this for simple, one-off handlers that don't need to be shared.
- **External reducer** (`app.reducer.ts`) — the `[+]` button is a *named* card
  registered with `registerCard()`; its handler lives separately in
  `app.reducer.ts` and is wired up via `register()` + `onButtonClicked`.

```ts
// src/app.pihanga.ts
import {registerCard, registerFramework} from "@pihanga2/core";

// npm channel — import cards from the installed @pihanga2/shadcn package
import {SdFramework} from "@pihanga2/shadcn/cards/framework";
import {Stack} from "@pihanga2/shadcn/cards/stack";
import {Button} from "@pihanga2/shadcn/cards/button";
import {Typography} from "@pihanga2/shadcn/cards/typography";

// Registry channel alternative — replace the imports above with:
// import {SdFramework} from "@/cards/framework";
// import {Stack}       from "@/cards/stack";
// import {Button}      from "@/cards/button";
// import {Typography}  from "@/cards/typography";

import type {AppState} from "./app.state";

export function appPiInit(): void {
  // ── Root framework card ────────────────────────────────────────────────────
  // Registers the single "_window" card that wraps the app in ThemeProvider.
  registerFramework(SdFramework({page: "counter/page", theme: "light"}));

  // ── Counter page ──────────────────────────────────────────────────────────
  // A horizontal Stack containing two Buttons and a live count display.
  //
  // Inline `onClicked` handlers are Immer reducers: mutate `state` directly.
  // The Typography `text` prop is a state-selector — it re-runs whenever the
  // Redux state changes and returns a new string.
  registerCard(
    "counter/page",
    Stack<AppState>({
      direction: "row",
      alignItems: "center",
      spacing: 4,
      className: "p-16 justify-center",
      content: [
        // [−] Decrement — inline handler (anonymous card)
        Button<AppState>({
          label: "−",
          opts: {size: "lg"},
          onClicked: (state) => {
            state.count -= 1;
          },
        }),

        // Live count display — re-renders on every state change
        Typography<AppState>({
          text: (s) => `Count: ${s.count}`,
          level: "h2",
          className: "min-w-[120px] text-center",
        }),

        // [+] Increment — named card; handler lives in app.reducer.ts
        "counter/plus",
      ],
    }),
  );

  // Named card for the [+] button — event handled externally in app.reducer.ts
  registerCard(
    "counter/plus",
    Button({
      label: "+",
      opts: {size: "lg"},
    }),
  );
}
```

### `src/app.reducer.ts` — external event handlers

`app.reducer.ts` demonstrates the **external reducer** pattern: using
`register()` + a card-specific `on*` helper instead of an inline `onClicked`
attribute.  This is the preferred approach for named cards whose events need to
be handled from a different module, or for any handler that spans multiple cards.

```ts
// src/app.reducer.ts
import {register} from "@pihanga2/core";
import {onButtonClicked} from "@pihanga2/shadcn/cards/button";

// Registry channel alternative:
// import {onButtonClicked} from "@/cards/button";

import type {AppState} from "./app.state";

register((r) => {
  // Handle the named "counter/plus" button click.
  // `cardID` matches the name passed to registerCard() in app.pihanga.ts.
  // The handler runs on EVERY button-click action; the cardID check ensures
  // we only react to the "+" button.
  onButtonClicked<AppState>(r, (state, {cardID}) => {
    if (cardID === "counter/plus") {
      state.count += 1;
    }
  });
});
```

> **Comparison of the two patterns:**
>
> | Pattern | When to use |
> |---|---|
> | Inline `onClicked` on the card | Simple, one-off handler scoped to one card |
> | `register()` + `on*` in `app.reducer.ts` | Named cards, handlers shared across modules, or complex multi-step logic |

### `src/main.ts` — entry point

```ts
// src/main.ts
import "./index.css";
import {DEFAULT_REDUX_STATE, start} from "@pihanga2/core";

import type {AppState} from "./app.state";
import {appPiInit} from "./app.pihanga";
import "./app.reducer"; // registers the external onButtonClicked handler
import {RootComponent} from "./app.root";

const initState: AppState = {
  ...DEFAULT_REDUX_STATE,
  count: 0,
};

start(initState, [appPiInit], {
  rootComponent: RootComponent,
});
```

> **Note:** when using the npm channel (`@pihanga2/shadcn/cards/...`), card
> modules register themselves when imported — so there is no need for explicit
> `import "@/cards/framework"` statements in `main.ts`.  The imports in
> `app.pihanga.ts` and `app.reducer.ts` are sufficient.

---

## Putting it all together — minimal working app

After completing all steps above, your project (counter example) should look
like:

```
my-app/
├── src/
│   ├── app.types.ts          ← error envelope type definitions
│   ├── app.state.ts          ← AppState: { count: number }
│   ├── app.pihanga.ts        ← registerFramework + registerCard declarations
│   ├── app.reducer.ts        ← register() + onButtonClicked handler
│   ├── app.root.tsx          ← copy from example/src/app.root.tsx
│   ├── main.ts               ← start() entry point
│   ├── index.css             ← full Tailwind v4 + shadcn theme
│   └── components/
│       └── lib/
│           └── utils.ts      ← cn() helper
├── vite.config.ts            ← path aliases + optimizeDeps
├── tsconfig.json             ← @/* and subsidiary path aliases
└── package.json              ← @pihanga2/core + @pihanga2/shadcn deps
```

> **Live reference:** the complete working counter app lives in
> [`example/`](https://github.com/ivcap-works/pihanga-shadcn/tree/main/example)
> in the pihanga-shadcn repository.  Run it with:
>
> ```sh
> cd example
> yarn install
> yarn dev
> ```

Start your own development server:

```sh
npm run dev   # or: yarn dev / pnpm dev
```

---

## Next steps

| Topic | Guide |
|---|---|
| Install and wire more cards | [`AGENT.using-cards.md`](./AGENT.using-cards.md) |
| `memo()`, multi-page nav, MarkdownViewer | [`AGENT.using-cards.md`](./AGENT.using-cards.md) |
| Build a new card type | [`AGENT.building-cards.md`](./AGENT.building-cards.md) |
| Full project structure and publishing | [`README.md`](./README.md) |
