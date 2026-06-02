# pihanga-shadcn

A collection of **Pihanga cards** built on top of the [shadcn/ui](https://ui.shadcn.com/) component library.

[Pihanga](https://github.com/ivcap-works/pihanga) is a declarative, card-based UI framework for React. Each *card* is an independently registered UI unit with typed props, events, and Redux-backed state management. This repository provides a ready-to-use library of shadcn/ui-styled Pihanga cards together with a live **Playground** app for browsing and experimenting with them.

## Stack

- **Card Framework**: [@pihanga2/core](https://github.com/ivcap-works/pihanga) — declarative card system with Redux state management
- **Build**: [Vite](https://vite.dev/) v6
- **UI Framework**: [React](https://react.dev/) v19
- **Language**: [TypeScript](https://www.typescriptlang.org/) ~5.8
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (new-york style) + [Radix UI](https://www.radix-ui.com/) primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting**: [ESLint](https://eslint.org/) v9 (flat config) + typescript-eslint
- **Testing**: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)

## Available Cards

| Card | ID | Description |
|---|---|---|
| **Badge** | `shad/badge` | Status badge with variant support |
| **Box** | `shad/box` | Generic container / layout box |
| **Button** | `shad/button` | Clickable button with icon support |
| **Checkbox** | `shad/checkbox` | Boolean toggle, form-aware |
| **DataTable** | `shad/data-table` | Sortable, paginated data table |
| **Dialog** | `shad/dialog` | Modal dialog with configurable content |
| **DropDownMenu** | `shad/drop-down-menu` | Contextual drop-down with labels, separators, radio & checkbox groups |
| **Field** | `shad/field` | Labelled form field wrapper |
| **FlexGrid** | `shad/flex-grid` | CSS flex/grid layout card |
| **Form** | `pi/form` | Form container managing field state and validation |
| **Framework** | `shad/framework` | Top-level application shell card |
| **Input** | `shad/input` | Text input, form-aware |
| **JsonViewer** | `shad/json-viewer` | Interactive JSON tree viewer |
| **List** | `shad/list` | Scrollable item list |
| **LoadingOverlay** | `shad/loading-overlay` | Full-area loading spinner overlay |
| **MarkdownViewer** | `shad/markdown-viewer` | Rendered Markdown with code highlighting and KaTeX math |
| **Menu** | `shad/menu` | Navigation menu bar |
| **ModeToggle** | `shad/mode-toggle` | Light / dark / system theme switcher |
| **NavbarSearch** | `shad/navbar-search` | Search field for use in a navigation bar |
| **PageWithNavbar** | `shad/page-with-navbar` | Full-page layout with top navbar, sidebar, and main content area |
| **PasteTarget** | `shad/paste-target` | Invisible paste-event receiver |
| **Resizable** | `shad/resizable` | Horizontally or vertically resizable split pane |
| **Select** | `shad/select` | Drop-down select / combobox, form-aware |
| **Stack** | `shad/stack` | Vertical or horizontal card stack |
| **Stepper** | `shad/stepper` | Step-by-step wizard / progress indicator |
| **Switch** | `shad/switch` | Toggle switch, form-aware |
| **Tabs** | `shad/tabs` | Tabbed panel with card-per-tab content |
| **TextField** | `shad/text-field` | Multi-line textarea, form-aware |
| **Toast** | `shad/toast` | Transient notification toasts (via Sonner) |
| **ToggleGroup** | `shad/toggle-group` | Exclusive or multi-select toggle button group |
| **Typography** | `shad/typography` | Styled heading / paragraph / prose renderer |

## Quick Start

```bash
# Install dependencies
yarn install

# Start the Playground development server
make dev          # or: yarn dev

# Run all checks: lint + type-check + tests (CI)
make check

# Run tests (watch mode)
make test         # or: yarn test

# Lint
make lint         # or: yarn lint

# Type check
make type-check   # or: yarn type-check

# Production build
make build        # or: yarn build
```

## Project Structure

```
src/
├── cards/                    # Pihanga card library (one folder per card)
│   ├── <cardName>/
│   │   ├── index.ts          # Registration & re-exports
│   │   ├── <card>.types.ts   # Card ID, props, events, action wiring
│   │   ├── <card>.component.tsx  # React implementation
│   │   ├── <card>.example.ts # Playground demo config
│   │   └── dependencies.json # External npm deps declared per-card
│   └── BUILDING_CARDS_HOWTO.md  # Guide for creating new cards
├── components/
│   └── ui/                   # Raw shadcn/ui primitives (auto-generated)
├── playground/               # Interactive card browser / demo app
├── lib/
│   └── utils.ts              # cn() helper and shared utilities
├── app.pihanga.ts            # Top-level app card wiring
├── app.state.ts              # Redux store bootstrap
├── index.css                 # Tailwind CSS + CSS variables
├── main.ts                   # App entry point
└── vite-env.d.ts
```

## Building a New Card

See [`src/cards/BUILDING_CARDS_HOWTO.md`](src/cards/BUILDING_CARDS_HOWTO.md) for a detailed guide. The short version:

1. **Create** `src/cards/<yourCard>/`
2. **Define** props & events in `<yourCard>.types.ts` using `createCardDeclaration<Props, Events>(CARD_ID)`
3. **Implement** the React component in `<yourCard>.component.tsx` — receives `PiCardProps<Props, Events>`
4. **Register** the component in `index.ts` via `registerCardComponent({ name, component, events })`
5. **Declare** external dependencies in `dependencies.json`
6. **Add** an `<yourCard>.example.ts` to expose the card in the Playground

## Adding shadcn/ui Primitives

If a new card needs a shadcn/ui primitive that isn't already in `src/components/ui/`:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```
