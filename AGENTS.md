# pihanga-shadcn — Developer Guide

Welcome to **pihanga-shadcn**!  This guide walks you through everything you
need to get up and running — from project setup through building multi-page
apps with reactive state.

---

## What is pihanga-shadcn?

`pihanga-shadcn` is a library of **Pihanga card components** built on top of
[shadcn/ui](https://ui.shadcn.com) and [Radix UI](https://radix-ui.com).

**The key idea:** instead of publishing a binary npm package, each card is
distributed as a *shadcn-style copy-on-install registry entry*.  When you run
`npx shadcn@latest add <url>` the CLI copies the card's TypeScript source files
directly into your project — you own the code and can customise it freely.

| Resource | URL |
|----------|-----|
| Registry base URL | `https://ivcap-works.github.io/pihanga-shadcn/r` |
| Source repository | `https://github.com/ivcap-works/pihanga-shadcn` |

---

## Table of Contents

- [Prerequisites — one-time project setup](#prerequisites--one-time-project-setup)
- [Adding cards to your project](#adding-cards-to-your-project)
  - [Available cards](#available-cards)
- [Bootstrapping a Pihanga app](#bootstrapping-a-pihanga-app)
  - [One `registerFramework` per app](#one-registerframework-per-app)
- [Reactive state with `memo()`](#reactive-state-with-memo)
- [Multi-page navigation with `PageWithNavbar`](#multi-page-navigation-with-pagewithnavbar)
- [`MarkdownViewer` — inline content vs. fetched file](#markdownviewer--inline-content-vs-fetched-file)
- [Pinning to a specific version](#pinning-to-a-specific-version)
- [Quick reference](#quick-reference)

---

## Prerequisites — one-time project setup

### 1 — Initialise shadcn

If your project doesn't already have shadcn configured, run:

```sh
npx shadcn@latest init
```

When prompted, choose:
- **Style**: New York
- **Base colour**: Neutral
- **CSS variables**: Yes

This creates `components.json`, adds the `@/` TypeScript path alias, and
installs Tailwind CSS if it isn't present yet.

### 2 — Check the `@/cards` alias

Pihanga cards land in `src/cards/` and import each other via `@/cards/`.  The
`@/*` → `./src/*` mapping that `shadcn init` creates already covers this, so
**no extra alias is usually needed**.

If your cards live somewhere other than `src/cards/`, add an explicit mapping
to `tsconfig.json`:

```jsonc
// tsconfig.json → compilerOptions.paths
{
  "compilerOptions": {
    "paths": {
      "@/*":       ["./src/*"],
      "@/cards/*": ["./src/cards/*"]   // only needed if cards are NOT under src/
    }
  }
}
```

---

## Adding cards to your project

Once the one-time setup is done, add any card with a single command.
`@pihanga2/core` and all card-specific npm packages are installed automatically
by the shadcn CLI — no separate `npm install` needed.

```sh
# Add a single card
npx shadcn@latest add https://ivcap-works.github.io/pihanga-shadcn/r/button

# Add several cards at once
npx shadcn@latest add \
  https://ivcap-works.github.io/pihanga-shadcn/r/button \
  https://ivcap-works.github.io/pihanga-shadcn/r/form \
  https://ivcap-works.github.io/pihanga-shadcn/r/dataTable
```

### Available cards

| Card | Add URL |
|------|---------|
| badge | `…/r/badge` |
| box | `…/r/box` |
| button | `…/r/button` |
| checkbox | `…/r/checkbox` |
| dataTable | `…/r/dataTable` |
| dialog | `…/r/dialog` |
| dropDownMenu | `…/r/dropDownMenu` |
| field | `…/r/field` |
| flexGrid | `…/r/flexGrid` |
| form | `…/r/form` |
| framework | `…/r/framework` |
| graphin | `…/r/graphin` |
| input | `…/r/input` |
| jsonViewer | `…/r/jsonViewer` |
| list | `…/r/list` |
| loadingOverlay | `…/r/loadingOverlay` |
| markdownViewer | `…/r/markdownViewer` |
| menu | `…/r/menu` |
| modeToggle | `…/r/modeToggle` |
| navbarSearch | `…/r/navbarSearch` |
| pageWithNavbar | `…/r/pageWithNavbar` |
| pasteTarget | `…/r/pasteTarget` |
| resizable | `…/r/resizable` |
| select | `…/r/select` |
| stack | `…/r/stack` |
| stepper | `…/r/stepper` |
| switch | `…/r/switch` |
| tabs | `…/r/tabs` |
| textField | `…/r/textField` |
| toast | `…/r/toast` |
| toggleGroup | `…/r/toggleGroup` |
| typography | `…/r/typography` |

> **Heads up on `graphin`:** this card pulls in the full AntV graph library
> (~5 MB).  Only add it if you actually need graph visualisation.

Full registry index (JSON):
```
https://ivcap-works.github.io/pihanga-shadcn/r/registry.json
```

---

## Bootstrapping a Pihanga app

All app wiring lives in an *init function* (conventionally named `appPiInit`)
that you pass to `start()`.  Three core APIs do the heavy lifting:

| API | What it does |
|-----|-------------|
| `registerFramework(card)` | Sets the single root card that wraps your whole app. Call exactly **once**. |
| `registerCard(id, card)` | Gives a card a name so other cards (and `memo`) can reference it. |
| `register(r => { … })` | Wires up event handlers and state reducers. |

### `src/main.ts`

```ts
import {start, DEFAULT_REDUX_STATE} from "@pihanga2/core";
import {appPiInit} from "./app.pihanga";
import {RootComponent} from "./app.root";

start({...DEFAULT_REDUX_STATE}, [appPiInit], {
  rootComponent: RootComponent,
});
```

### `src/app.pihanga.ts`

```ts
import {registerFramework, registerCard, register} from "@pihanga2/core";
import {SdFramework} from "./cards/framework";

export function appPiInit(): void {
  registerFramework(SdFramework({page: "app/main", theme: "light"}));
  registerCard("app/main", /* … your root card … */);
}
```

### One `registerFramework` per app

If you compose multiple init functions (e.g. `appPiInit` internally calls
`playgroundPiInit`), make sure only **one** of them calls `registerFramework`.
A second call will silently win or produce unexpected results.

```ts
// ❌ Both call registerFramework
const inits = [appPiInit, playgroundPiInit];

// ✅ appPiInit absorbs playgroundPiInit after removing its registerFramework call
export function appPiInit(): void {
  playgroundPiInit();                    // no longer calls registerFramework
  registerFramework(SdFramework({…}));
}
```

---

## Reactive state with `memo()`

`memo(selector, mapper)` makes any card prop **automatically update** when
state changes.  The selector picks a slice of Redux state; the mapper converts
that slice to the final prop value.  Pihanga re-renders only when the
selector's return value changes (shallow equality).

```ts
import {memo} from "@pihanga2/core";
import type {AppState} from "@/app.state";

// Switch the rendered card based on state.currentPage
main: memo(
  (s: AppState) => s.currentPage ?? "home",
  (page) => `app/page/${page}`,          // e.g. "app/page/home"
),
```

`memo` can return arrays, objects, or any serialisable value — not just strings:

```ts
items: memo(
  (s: AppState) => s.selectedId,
  (selectedId) => myList.map(item => ({
    ...item,
    isSelected: item.id === selectedId,
  })),
),
```

---

## Multi-page navigation with `PageWithNavbar`

The standard pattern for a multi-page app:

1. Declare `navLinks` in `PageWithNavbar`.
2. Register an `onPageWithNavbarNavigateTo` handler that stores the active link
   id in Redux state.
3. Pass a `memo`-driven string to `main` so the rendered card switches when
   state changes.

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

  // Store the clicked nav link in state
  register((r) => {
    onPageWithNavbarNavigateTo(r, (state: AppState, {id}) => {
      state.currentPage = id;
    });
  });

  registerCard("app/main", PageWithNavbar({
    title: "My App",
    navLinks: [
      {id: "home",     title: "Home"},
      {id: "settings", title: "Settings"},
    ],
    // main resolves to "app/page/home" or "app/page/settings"
    main: memo(
      (s: AppState) => s.currentPage ?? "home",
      (page) => `app/page/${page}`,
    ),
  }));

  registerCard("app/page/home",     /* … */);
  registerCard("app/page/settings", /* … */);
}
```

Remember to add `currentPage` to your app state type:

```ts
// src/app.state.ts
export type AppState = ReduxState & {
  currentPage?: string;
  // … other fields
};
```

---

## `MarkdownViewer` — inline content vs. fetched file

The `markdownViewer` card can render markdown from two sources:

```ts
// Option A: inline string
MarkdownViewer({source: "# Hello\nSome **markdown**."})

// Option B: fetch from a URL
MarkdownViewer({path: "/AGENTS.md"})
```

When you use `path`, the file must be reachable at that URL in both the dev
server and production build.  The cleanest approach is a small **inline Vite
plugin** — it serves the file on-the-fly from the project root during
development and emits it into `dist/` during a production build, so you never
need a stale copy in `public/`.

```ts
// vite.config.ts
import path from "path";
import {readFileSync} from "fs";
import type {Plugin} from "vite";

function rootFilePlugin(filenames: string[]): Plugin {
  return {
    name: "root-file-serve",
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
  plugins: [react(), tailwindcss(), rootFilePlugin(["AGENTS.md"])],
  // …
});
```

---

## Pinning to a specific version

To lock your project to a particular release, use the raw GitHub URL with a
version tag:

```sh
npx shadcn@latest add \
  https://raw.githubusercontent.com/ivcap-works/pihanga-shadcn/v1.0.0/public/r/button.json
```

Or with versioned GitHub Pages paths (once published):

```sh
npx shadcn@latest add \
  https://ivcap-works.github.io/pihanga-shadcn/v1.0.0/r/button
```

---

## Quick reference

| Task | Command / snippet |
|------|-------------------|
| One-time shadcn init | `npx shadcn@latest init` |
| Add a card | `npx shadcn@latest add https://…/r/<card>` |
| Start dev server | `npm run dev` (or `yarn dev`) |
| Production build | `npm run build` (or `yarn build`) |
| Register root card | `registerFramework(SdFramework({page: "app/main"}))` |
| Register a named card | `registerCard("app/main", MyCard({…}))` |
| Reactive prop | `memo((s: AppState) => s.foo, (foo) => …)` |
| Handle nav click | `onPageWithNavbarNavigateTo(r, (state, {id}) => { state.currentPage = id })` |
