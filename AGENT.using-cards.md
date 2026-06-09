# AGENT.using-cards.md — consuming pihanga-shadcn cards

> **Scope:** installing, wiring, composing, and navigating with existing cards.
> Read [`AGENT.md`](./AGENT.md) first for orientation and universal rules.
> If you need to *create* a new card type, switch to
> [`AGENT.building-cards.md`](./AGENT.building-cards.md).

---

## Prerequisites (one-time project setup)

### 1 — Initialise shadcn (creates `components.json` and `@/` alias)

```sh
npx shadcn@latest init
```

When prompted, choose:
- **Style**: New York
- **Base colour**: Neutral
- **CSS variables**: Yes

This command creates `components.json`, patches `tsconfig.json` with the `@/`
path alias, and installs Tailwind CSS if not already present.

### 2 — Ensure `@/cards` alias is configured

Pihanga cards are copied to `src/cards/` and import each other via the
`@/cards/` alias.  After `shadcn init`, add this alias to `tsconfig.json`:

```jsonc
// tsconfig.json  →  compilerOptions.paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

The `@/*` → `./src/*` mapping (which `shadcn init` creates) already covers
`@/cards/` → `src/cards/`, so **no extra alias is needed** as long as cards
are placed at `src/cards/`.

If cards end up elsewhere, add an explicit alias:
```jsonc
"@/cards/*": ["./src/cards/*"]
```

---

## Adding individual cards

After the one-time setup above, add any card with a single command.
`@pihanga2/core` and all card-specific npm packages are installed automatically.

```sh
# Add a single card
npx shadcn@latest add https://ivcap-works.github.io/pihanga-shadcn/r/button

# Add multiple cards at once
npx shadcn@latest add \
  https://ivcap-works.github.io/pihanga-shadcn/r/button \
  https://ivcap-works.github.io/pihanga-shadcn/r/form \
  https://ivcap-works.github.io/pihanga-shadcn/r/dataTable
```

### Available cards

| Card | URL fragment |
|------|-------------|
| badge | `/r/badge` |
| box | `/r/box` |
| button | `/r/button` |
| checkbox | `/r/checkbox` |
| **conditional** | `/r/conditional` |
| dataTable | `/r/dataTable` |
| dialog | `/r/dialog` |
| dropDownMenu | `/r/dropDownMenu` |
| field | `/r/field` |
| flexGrid | `/r/flexGrid` |
| form | `/r/form` |
| framework | `/r/framework` |
| graphin | `/r/graphin` |
| input | `/r/input` |
| jsonViewer | `/r/jsonViewer` |
| list | `/r/list` |
| loadingOverlay | `/r/loadingOverlay` |
| **loadingSkeleton** | `/r/loadingSkeleton` |
| markdownViewer | `/r/markdownViewer` |
| menu | `/r/menu` |
| modeToggle | `/r/modeToggle` |
| navbarSearch | `/r/navbarSearch` |
| pageWithNavbar | `/r/pageWithNavbar` |
| pasteTarget | `/r/pasteTarget` |
| resizable | `/r/resizable` |
| select | `/r/select` |
| stack | `/r/stack` |
| stepper | `/r/stepper` |
| switch | `/r/switch` |
| tabs | `/r/tabs` |
| textField | `/r/textField` |
| toast | `/r/toast` |
| toggleGroup | `/r/toggleGroup` |
| typography | `/r/typography` |

Full registry index:
```
https://ivcap-works.github.io/pihanga-shadcn/r/registry.json
```

---

## Notes for AI agents

- The registry automatically installs all required npm packages (including
  `@pihanga2/core`) when you run `npx shadcn@latest add <url>`.
- Cards are copied to `src/cards/<card-name>/` in the consumer's project.
- The `framework` card is the Pihanga app root — add it first for new apps.
- The `graphin` card has heavy AntV dependencies (~5 MB); only install it if
  graph visualisation is explicitly required.
- After running `npx shadcn@latest add`, no further manual `npm install` steps
  are needed — the shadcn CLI handles all dependency installation.

---

## Using cards in your app

After installation, each card is registered automatically when its `index.ts`
is imported.  Bootstrap Pihanga in your app entry point:

```ts
// src/main.ts (or src/main.tsx)
import "@pihanga2/core";                  // Pihanga runtime (installed by registry)

// Import the cards you want to activate
import "./cards/button";
import "./cards/form";
// etc.
```

Then declare a card in your Pihanga state definition:

```ts
import { Button } from "./cards/button";

// Somewhere in your app initialisation:
Button({
  id: "save",
  label: "Save",
  opts: { variant: "default" },
  onClicked: (ev) => console.log("clicked", ev.id),
});
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

### `pi/input` — the labeled standalone text input (not `pi/text-input`)

The card you want for a freestanding labeled input (e.g. a JWT token field, a
search box, a settings field) is **`pi/input`** — *not* `pi/text-input`, which
does not exist.

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
  value:       memo((s: AppState) => s.jwtToken),
  placeholder: "Paste your bearer token here…",
  type:        "password",
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
