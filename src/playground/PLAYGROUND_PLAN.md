# Playground — Implementation Plan

## Overview

The Playground is a documentation-driven demo environment embedded in the app.
It provides:

1. **A card list** (left panel) — one entry per registered card.
2. **A detail view** (right panel) — for the selected card, showing:
   - A written **introduction** (markdown prose).
   - Named **facets** shown as self-managed tabs — each tab displays the
     facet description and its prop values as JSON.
   - A **live preview** of the card rendered with the current prop values.
   - A **controls panel** with interactive prop toggles (token-pills, select,
     text, boolean).
   - A **code/JSON view** at the bottom of the preview.
   - A **real-app usage note** (markdown) below the interactive area.
3. **Multiple facets** — named usage scenarios that pre-load a specific set of
   props into the preview.

---

## Current Status (as of last update)

### ✅ Done

| Item | File(s) |
|---|---|
| `PlaygroundDef` type + `note` field | `playground.types.ts` |
| `definePlayground()` helper with runtime validation | `definePlayground.ts` |
| `PlaygroundState` slice | `playground.state.ts` |
| `registry.ts` — dynamic runtime registry | `registry.ts` |
| `badge.example.ts` migrated to `definePlayground` + `note` | `cards/badge/badge.example.ts` |
| `input.example.ts` migrated to `definePlayground` + `note` | `cards/input/input.example.ts` |
| Static example generator script | `scripts/gen-playground-registry.mjs` |
| Generated static list | `playground.examples.gen.ts` |
| `playground.pihanga.ts` — full page wiring (list + detail + state) | `playground.pihanga.ts` |
| `AppState` extended with `PlaygroundState` | `app.state.ts` |
| `main.ts` wired to `playgroundPiInit` | `main.ts` |
| `playground/index.ts` barrel updated | `index.ts` |

### ✅ Done (updated)

| Item | File(s) |
|---|---|
| `pi/markdown` via `MarkdownViewer` card | `playground.pihanga.ts` |
| Facet JSON via `JsonViewer` card | `playground.pihanga.ts` |
| `button.example.ts` migrated to `definePlayground` | `cards/button/button.example.ts` |
| `tabs.example.ts` migrated to `definePlayground` | `cards/tabs/tabs.example.ts` |
| `stepper.example.ts` migrated to `definePlayground` | `cards/stepper/stepper.example.ts` |
| `dataTable.example.ts` migrated to `definePlayground` | `cards/dataTable/dataTable.example.ts` |
| `dialog.example.ts` migrated to `definePlayground` | `cards/dialog/dialog.example.ts` |
| `drop-down.example.ts` migrated to `definePlayground` | `cards/dropDownMenu/drop-down.example.ts` |
| `form.example.ts` migrated to `definePlayground` | `cards/form/form.example.ts` |
| `toast.example.ts` migrated to `definePlayground` | `cards/toast/toast.example.ts` |
| `markdownViewer.example.ts` migrated to `definePlayground` | `cards/markdownViewer/markdownViewer.example.ts` |
| `toggleGroup.example.ts` created with `definePlayground` | `cards/toggleGroup/toggleGroup.example.ts` |
| `switch.example.ts` created with `definePlayground` | `cards/switch/switch.example.ts` |
| `token` control widget → `ToggleGroup` + `name: ctrl.prop` | `playground.pihanga.ts` |
| `boolean` control widget → `Switch` + `name: ctrl.prop` | `playground.pihanga.ts` |
| `text` control widget → `PiInput` + `name: ctrl.prop` | `playground.pihanga.ts` |
| `select` control widget → `Select` + `name: ctrl.prop` | `playground.pihanga.ts` |
| `onPiToggleGroupChanged` / `onPiSwitchChanged` / `onPiSelectChanged` / `onPiInputCommitted` registered globally; `patchPgProp` guard validates against `controls[].prop` | `playground.pihanga.ts` |
| Controls section fully wired — clicking a widget immediately patches `state.playgroundCurrentProps` and re-renders the live preview | `playground.pihanga.ts` |
| Generated static list (14 entries) | `playground.examples.gen.ts` |

### ✅ Done (events panel)

| Item | File(s) |
|---|---|
| `PlaygroundEventRecord` type — serialisable captured event entry | `playground.types.ts` |
| `PlaygroundLogEventFn` type — logger callback passed to `registerEvents` | `playground.types.ts` |
| `registerEvents` optional field on `PlaygroundDef` | `playground.types.ts` |
| `playgroundEventLog?: PlaygroundEventRecord[]` state field | `playground.state.ts` |
| `makeEventLogger(cardId)` — returns a scoped logger that only fires for the matching card | `playground.pihanga.ts` |
| `buildFacetSection` extended: when `registerEvents` present, splits the bottom row into props JSON (left) + event log panel (right), mirroring the Controls layout | `playground.pihanga.ts` |
| Event log panel: scrollable `min-h-[120px] max-h-[360px]` stack of `JsonViewer` entries, newest first | `playground.pihanga.ts` |
| Event log cleared on card select and facet tab switch | `playground.pihanga.ts` |
| `memo()` selector extended to include `s.playgroundEventLog` — rebuilds detail panel on each event | `playground.pihanga.ts` |
| Per-def event handler loop in `register()` block — calls `def.registerEvents(r, makeEventLogger(def.cardId))` | `playground.pihanga.ts` |
| `button.example.ts` — `registerEvents` for `onButtonClicked` | `cards/button/button.example.ts` |
| `toggleGroup.example.ts` — `registerEvents` for `onPiToggleGroupChanged` | `cards/toggleGroup/toggleGroup.example.ts` |
| `switch.example.ts` — `registerEvents` for `onPiSwitchChanged` | `cards/switch/switch.example.ts` |
| `input.example.ts` — `registerEvents` for `onPiInputChanged` + `onPiInputCommitted` | `cards/input/input.example.ts` |

### ❌ Missing cards — blocking full fidelity

See the [Missing Cards](#missing-cards--next-steps) section below.

---

## File / Folder Layout

```
src/playground/
  PLAYGROUND_PLAN.md              ← this file
  index.ts                        ← public API barrel
  playground.pihanga.ts           ← ✅ page + card wiring
  playground.state.ts             ← ✅ PlaygroundState type
  playground.types.ts             ← ✅ PlaygroundDef, PlaygroundFacet, PlaygroundControl
  definePlayground.ts             ← ✅ authoring helper
  registry.ts                     ← ✅ dynamic runtime registry (alternative to gen list)
  playground.examples.gen.ts      ← ✅ AUTO-GENERATED static list (run yarn gen-playground)

scripts/
  gen-playground-registry.mjs    ← ✅ scans src/cards/ and writes playground.examples.gen.ts

src/cards/<card>/
  <card>.example.ts               ← authoring target (default export = PlaygroundDef)
```

Planned sub-cards (not yet created):

```
src/playground/cards/             ← does not exist yet (inline approach used instead)
  playgroundPreview/              ← ✅ inline — built directly in buildFacetSection/buildControlsSection
  playgroundControls/             ← ✅ inline — buildControlWidget creates the right card per control type
  playgroundCodeView/             ← ❌ pretty-printed JSON + Copy button (JsonViewer used for now)

src/cards/
  markdown/                       ← ❌ pi/markdown — renders markdown string as HTML
  codeBlock/                      ← ❌ pi/code-block — syntax-highlighted <pre> block
```

---

## Core Data Types (`playground.types.ts`)

```ts
export type PlaygroundDef<P extends Record<string, unknown> = Record<string, unknown>> = {
  /** Must match the card's CARD_ID constant, e.g. "shad/badge". */
  cardId: string;

  /** Human-readable display name shown in the list and page heading. */
  title: string;

  /**
   * Introduction rendered above the live preview.
   * Plain markdown — requires pi/markdown card to render properly.
   * Currently falls back to Typography (plain text).
   */
  introduction: string;

  /**
   * Starting props for the live preview.
   * Must be fully JSON-serialisable — no memo() wrappers.
   */
  defaultProps: P;

  /** Named usage scenarios shown as tabs above the preview. */
  facets?: PlaygroundFacet<Partial<P>>[];

  /**
   * Declarative controls rendered in the "Playground" side panel.
   * Currently ignored — requires playground/controls card.
   */
  controls?: PlaygroundControl[];

  /**
   * Real-app usage note rendered below the playground.
   * Plain markdown — requires pi/markdown card to render properly.
   * Currently falls back to Typography (plain text).
   */
  note?: string;
};

export type PlaygroundFacet<P = Record<string, unknown>> = {
  id: string;
  title: string;
  description?: string;
  props: P;
};

export type PlaygroundControl =
  | TokenControl    // pill-row single-select
  | SelectControl   // <select> dropdown
  | TextControl     // free-form text input
  | BooleanControl; // checkbox toggle

export type TokenControl   = { prop: string; type: "token";   label?: string; options: string[] };
export type SelectControl  = { prop: string; type: "select";  label?: string; options: string[] };
export type TextControl    = { prop: string; type: "text";    label?: string; placeholder?: string };
export type BooleanControl = { prop: string; type: "boolean"; label?: string };
```

---

## `definePlayground` Helper (`definePlayground.ts`)

A thin typed wrapper — validates required fields at module-load time, checks
that `defaultProps` is JSON-serialisable in DEV, and returns the definition
unchanged.

```ts
export default definePlayground<BadgeCardProps>({
  cardId: "shad/badge",
  title:  "Badge",
  introduction: "…",
  defaultProps: { label: "New", variant: "default" },
  facets:   [ … ],
  controls: [ … ],
  note: `…`,  // markdown; move real-app code examples here
});
```

---

## Authoring a New `<card>.example.ts`

### Rules

| Rule | Rationale |
|---|---|
| Default export is a `PlaygroundDef` object | Generator and engine can `import()` it |
| `defaultProps` contains only plain serialisable values | Safe for JSON viewer / editor |
| No `memo()` / `register()` calls | Those belong in `app.pihanga.ts` |
| `controls` mirrors the card's public Props type | Keeps example and types in sync |
| `facets` illustrate the most important usage patterns | Replaces old TSDoc `## Example N` blocks |
| Move trailing `// Real-app usage` comment block into `note` | Rendered below the playground |

### After adding / editing an example file

```sh
yarn gen-playground    # regenerates playground.examples.gen.ts
```

---

## `playground.pihanga.ts` — Current Wiring

```
PlaygroundCard.Page   PageWithNavbar "Playground"
  └─ FlexGrid  [list 260px | detail 1fr]
       ├─ PlaygroundCard.List   List (items memo'd from PLAYGROUND_EXAMPLES)
       └─ PlaygroundCard.Detail Stack (content memo'd from selected card)
            ├─ Typography h2         def.title
            ├─ MarkdownViewer        def.introduction   ✅ full markdown
            ├─ Typography h4         "Examples"         (only when facets exist)
            ├─ SdTabs                one tab per facet
            │    └─ Stack
            │         ├─ Stack (preview box)    def.preview(merged props)  ✅
            │         ├─ Typography muted       facet.description
            │         └─ [when registerEvents]  flex-row split:
            │              ├─ JsonViewer         facet.props  ✅ (left)
            │              └─ Stack (events panel)            (right)
            │                   ├─ Typography h  "Events"
            │                   └─ Stack (scrollable, min-h-[120px])
            │                        └─ [per event] Stack
            │                              ├─ Typography  ev.label (mono, xs)
            │                              └─ JsonViewer  ev.data
            │         [no registerEvents]   JsonViewer facet.props (single col)
            ├─ Typography h4         "Controls"         (only when controls exist)
            ├─ Stack (preview box)   def.preview(currentProps)  ✅
            ├─ Stack flex-row
            │    ├─ Stack (widgets)  one row per control
            │    └─ JsonViewer       currentProps  ✅ live JSON
            ├─ Typography h4         "Real-app usage"   (only when note exists)
            └─ MarkdownViewer        def.note           ✅ full markdown + code fences
```

**Event wiring:**
- `onListItemClicked` (filtered to `PlaygroundCard.List`) →
  `state.playgroundSelectedCardId = itemID`
- Detail content is a single `memo()` keyed on `playgroundSelectedCardId` — no
  extra reducers needed until controls / live preview land.

---

## Missing Cards — Next Steps

### 1. `pi/markdown` ← highest priority

Renders a markdown string as styled HTML using a lightweight parser
(e.g. `marked`, `micromark`, or `remark`).

```ts
// Proposed props
type MarkdownProps = {
  content: string;          // raw markdown
  className?: string;
};
```

**Integration points in `playground.pihanga.ts`:**
Replace the two `Typography({ level: "lead", text: def.introduction })` and
`Typography({ level: "muted", text: def.note })` calls with
`Markdown({ content: def.introduction })` / `Markdown({ content: def.note })`.

---

### 2. `pi/code-block` ← medium priority

Syntax-highlighted multi-line code block with an optional language tag and
Copy button.  Currently using `Typography({ level: "code" })` which renders
an inline `<code>` element and loses all newlines.

```ts
type CodeBlockProps = {
  code: string;             // source text
  language?: string;        // e.g. "ts", "json"
  showCopy?: boolean;       // default true
  className?: string;
};
```

**Integration points:**
- Facet props display: replace `Typography code` with `CodeBlock({ code: JSON.stringify(f.props, null, 2), language: "json" })`
- Note section code fences (once `pi/markdown` is in place, this may be handled automatically by the markdown renderer).

---

### 3. `playground/preview` ← enables live demo

A card that accepts a `cardId` + `props` object and renders the actual card
live.  This is the centrepiece of the playground — without it, only metadata
is shown.

```ts
type PlaygroundPreviewProps = {
  /** The card type to render, e.g. "shad/badge". */
  cardId: string;
  /** Current prop values (from state.playgroundCurrentProps). */
  props: Record<string, unknown>;
};
```

**How it would work:**
The component calls `registerCard(previewSlot, CardFactory(props))` on every
render (or on prop change) where `previewSlot` is a stable card name derived
from `cardId`.

**Integration into `playground.pihanga.ts`:**
Insert after the introduction in `buildDetailContent`:

```ts
items.push(
  // ← insert PlaygroundPreview here once the card exists
  // PlaygroundPreview({ cardId: def.cardId, props: state.playgroundCurrentProps }),
);
```

---

### 4. `playground/controls` ← enables interactive editing

Reads `PlaygroundDef.controls[]` and renders the appropriate widget per
control type.  Dispatches `onPlaygroundPropChanged` when a value changes.

```ts
type PlaygroundControlsProps = {
  controls: PlaygroundControl[];
  currentProps: Record<string, unknown>;
};
```

State wiring to add to `playground.pihanga.ts` once this card exists:

```ts
// In register((r) => { … })
onPlaygroundPropChanged(r, (state: AppState, {prop, value}) => {
  state.playgroundCurrentProps = {
    ...state.playgroundCurrentProps,
    [prop]: value,
  };
});
onPlaygroundFacetSelected(r, (state: AppState, {facetId}) => {
  const def = PLAYGROUND_EXAMPLES.find(d => d.cardId === state.playgroundSelectedCardId);
  const facet = def?.facets?.find(f => f.id === facetId);
  if (facet) {
    state.playgroundSelectedFacetId = facetId;
    state.playgroundCurrentProps = {...def!.defaultProps, ...facet.props};
  }
});
```

---

### 5. `playground/code-view` ← JSON viewer / editor bridge

Shows `state.playgroundCurrentProps` as pretty-printed JSON with a Copy
button.  Phase 2: swap the `<pre>` for a live JSON editor card.

```ts
type PlaygroundCodeViewProps = {
  value: Record<string, unknown>;  // the current prop object
  // onChanged will be wired in Phase 2 (JSON editor)
};
```

---

## Playground State (`playground.state.ts`)

```ts
export type PlaygroundState = {
  /** cardId of the card currently shown, e.g. "shad/badge". */
  playgroundSelectedCardId?: string;

  /** id of the selected facet for the active card. */
  playgroundSelectedFacetId?: string;

  /**
   * Live prop overrides driving the preview and JSON view.
   * Init: PlaygroundDef.defaultProps
   * On facet select: { ...defaultProps, ...facet.props }
   * On control change: patch one key at a time
   */
  playgroundCurrentProps?: Record<string, unknown>;
};
```

---

## Static Example Registry

`playground.examples.gen.ts` is **auto-generated** by the script:

```sh
yarn gen-playground          # or: node scripts/gen-playground-registry.mjs
make gen-playground
```

The script scans every `src/cards/**/*.example.ts` for files that contain
both `export default` and `definePlayground`.  It writes a typed
`PLAYGROUND_EXAMPLES: PlaygroundDef[]` array.

**Run it whenever** you:
- Add a new `*.example.ts` with a `definePlayground` default export.
- Remove or rename an existing example file.

---

## Migration Path for Existing `example.ts` Files

| File | Status |
|---|---|
| `badge.example.ts` | ✅ `definePlayground` + `note` |
| `input.example.ts` | ✅ `definePlayground` + `note` |
| `button.example.ts` | ✅ `definePlayground` + `note` |
| `tabs.example.ts` | ✅ `definePlayground` + `note` |
| `stepper.example.ts` | ✅ `definePlayground` + `note` |
| `dataTable.example.ts` | ✅ `definePlayground` + `note` |
| `dialog.example.ts` | ✅ `definePlayground` + `note` |
| `dropDownMenu/drop-down.example.ts` | ✅ `definePlayground` + `note` |
| `form.example.ts` | ✅ `definePlayground` + `note` |
| `toast.example.ts` | ✅ `definePlayground` + `note` |
| `markdownViewer.example.ts` | ✅ `definePlayground` + `note` |
| `jsonViewer.example.ts` | ✅ `definePlayground` + `note` |
| `toggleGroup.example.ts` | ✅ `definePlayground` + `note` |
| `switch.example.ts` | ✅ `definePlayground` + `note` |
| Others (no example.ts) | Add `example.ts` progressively |

---

## Rollout Order (revised)

| Step | Item | Status |
|---|---|---|
| 1 | `playground.types.ts` + `definePlayground.ts` | ✅ Done |
| 2 | `badge.example.ts` migration (+ `note` field) | ✅ Done |
| 3 | `input.example.ts` migration (+ `note` field) | ✅ Done |
| 4 | `playground/registry.ts` | ✅ Done |
| 5 | `scripts/gen-playground-registry.mjs` + generated file | ✅ Done |
| 6 | `playground.pihanga.ts` — list + detail (intro, facets, note) | ✅ Done |
| 7 | Markdown rendering in detail view | ✅ Done (via `MarkdownViewer` card) |
| 8 | Facet props display | ✅ Done (via `JsonViewer` card) |
| 9 | **Migrate remaining `example.ts` files** (14 total, incl. toggleGroup + switch) | ✅ Done |
| 10 | **`playground/preview`** card — live card render | ❌ Blocked on card registry design |
| 11 | **`playground/controls`** — token→`ToggleGroup`, boolean→`Switch`, inline handlers | ✅ Done |
| 12 | **`playground/code-view`** card — JSON viewer + Copy | ❌ After controls |
| 13 | Wire `playground/controls` + `playground/preview` into `playground.pihanga.ts` | ❌ After 10–12 |
| 14 | **Events panel** — `registerEvents` + `playgroundEventLog` + split facet layout | ✅ Done |
| 15 | Add `registerEvents` to remaining interactive cards (select, tabs, form, etc.) | ❌ Progressive |
| 16 | *(Phase 2)* JSON editor integration — drop-in swap in `playground/code-view` | ❌ Future |
