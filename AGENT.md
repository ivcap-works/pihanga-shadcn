# AGENT.md — pihanga-shadcn

AI coding assistants (Cline, Cursor, Windsurf, Claude, etc.) should read this
file at the start of every task in a project that uses `pihanga-shadcn` cards.

---

## What is pihanga-shadcn?

`pihanga-shadcn` is a library of **Pihanga card components** built on top of
[shadcn/ui](https://ui.shadcn.com) and [Radix UI](https://radix-ui.com).  Cards
are distributed as a **shadcn-style copy-on-install registry** — consumers run
`npx shadcn@latest add <url>` and the CLI copies the card's TypeScript source
files directly into the project, just like native shadcn components.

Registry base URL (GitHub Pages):
```
https://ivcap-works.github.io/pihanga-shadcn/r
```

Source repository:
```
https://github.com/ivcap-works/pihanga-shadcn
```

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

## Notes for AI agents

- The registry automatically installs all required npm packages (including
  `@pihanga2/core`) when you run `npx shadcn@latest add <url>`.
- Cards are copied to `src/cards/<card-name>/` in the consumer's project.
- The `framework` card is the Pihanga app root — add it first for new apps.
- The `graphin` card has heavy AntV dependencies (~5 MB); only install it if
  graph visualisation is explicitly required.
- After running `npx shadcn@latest add`, no further manual `npm install` steps
  are needed — the shadcn CLI handles all dependency installation.
