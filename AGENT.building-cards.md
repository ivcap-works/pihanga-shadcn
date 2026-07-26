# AGENT.building-cards.md — creating new pihanga-shadcn cards

> **Scope:** building new cards — either by composing existing cards into a
> **meta card** (recommended, TypeScript-only) or by adding a brand-new
> React-based primitive card to `src/cards/`.
> Read [`AGENT.md`](./AGENT.md) first for orientation and universal rules.
> If you only need to *use* existing cards in an app, switch to
> [`AGENT.using-cards.md`](./AGENT.using-cards.md).

---

## ⭐ Meta cards — composing new widgets from existing cards

> **This is the recommended approach for building any complex or reusable UI
> widget.**  A meta card is assembled entirely from existing cards using a
> plain TypeScript mapper function — no JSX, no React imports, no DOM
> knowledge required.  Read this section before considering a primitive card.

### Why meta cards?

| Concern | Meta card | New primitive card (React component) |
|---|---|---|
| Code volume | ~50 lines TypeScript | ~200 lines JSX + hooks |
| Maintenance | Inherits upstream card fixes automatically | Must track shadcn/Radix updates manually |
| Reusability | Portable across any Pihanga app unchanged | Tightly coupled to one project |
| Testability | Pure function — mock props, assert card tree | Requires DOM + Redux environment |
| Extendibility | Swap any inner card without touching consumers | Requires internal refactoring |
| Learning curve | Pihanga config patterns only | JSX, React hooks, Pihanga internals |

**Rule of thumb:** if you can describe the widget as *"a layout card containing
some input and display cards"*, build it as a meta card.  Only drop to a
primitive React component when the widget genuinely needs a DOM API, a
third-party React hook, or a non-card rendering strategy.

### How meta cards work

A meta card has three ingredients:

1. **Card declaration + actions** — same as any card; use
   `createCardDeclaration`, `registerActions`, `createOnAction`.
2. **Mapper function** — a plain function `(name, props, registerCard) =>
   PiCardDef` that assembles child cards and returns the root card definition.
3. **Registration** — `registerMetaCard({type, mapper, events})`.

The Pihanga runtime calls the mapper whenever the meta card needs to be
rendered or re-evaluated.  Child cards can use `resolve(props.foo)` inside
their own prop functions to lazily read a value that may itself be a state
selector.

### Full worked example — `Counter` meta card

The complete, annotated source lives at
[`example/src/counter.card.ts`](./example/src/counter.card.ts).
Abbreviated for reference:

```ts
import {
  createCardDeclaration, createOnAction, registerActions, registerMetaCard,
} from "@pihanga2/core";
import type {PiCardDef, PiMapProps, PiRegisterMetaCard, ReduxState, RegisterCardF} from "@pihanga2/core";
import {Stack, Button, Typography} from "@pihanga2/shadcn";

// ── 1. Card identity ─────────────────────────────────────────────────────────
const COUNTER_CARD = "meta/counter";   // convention: "meta/<name>" for app-level

// ── 2. Public factory (consumers call Counter({value: ...})) ────────────────
export const Counter = createCardDeclaration<CounterProps, CounterEvents>(COUNTER_CARD);

// ── 3. Actions + typed event helper ─────────────────────────────────────────
export const COUNTER_ACTION = registerActions(COUNTER_CARD, ["changed"]);
export const onCounterChanged = createOnAction<CounterChangeEvent>(COUNTER_ACTION.CHANGED);

// ── 4. Types ─────────────────────────────────────────────────────────────────
type CounterProps  = { value: number };
type CounterChangeEvent = { value: number };
type CounterEvents = { onChange: CounterChangeEvent };
type CounterMapperProps = CounterProps & CounterEvents;

// ── 5. Mapper — assembles child cards ────────────────────────────────────────
function CounterMapper(
  _: string,
  props: PiMapProps<CounterMapperProps, ReduxState, object>,
  registerCard: RegisterCardF,
): PiCardDef {
  // Register a child card under a stable name (optional but shown for reference)
  const plusButton = registerCard("plus", Button({
    label: "+",
    opts: {size: "lg"},
    // Re-map raw click → COUNTER_ACTION.CHANGED { value + 1 }
    onClickedMapper: (_, {resolve}) => ({
      type: COUNTER_ACTION.CHANGED,
      value: resolve(props.value) + 1,   // resolve() unwraps lazy state selectors
    }),
  }));

  return Stack({
    direction: "row", alignItems: "center", spacing: 4,
    className: "p-16 justify-center",
    content: [
      Button({
        label: "−",
        opts: {size: "lg"},
        onClickedMapper: (_, {resolve}) => ({
          type: COUNTER_ACTION.CHANGED,
          value: resolve(props.value) - 1,
        }),
      }),
      Typography({
        text: (_, {resolve}) => `Count: ${resolve(props.value)}`,   // reactive text
        level: "h2",
        className: "min-w-[120px] text-center",
      }),
      plusButton,
    ],
  });
}

// ── 6. Register ───────────────────────────────────────────────────────────────
registerMetaCard({
  type: COUNTER_CARD,
  mapper: CounterMapper,
  events: COUNTER_ACTION,
} satisfies PiRegisterMetaCard);
```

**Usage at the app level** (`example/src/app.pihanga.ts`):

```ts
import {Counter} from "./counter.card";
import type {AppState} from "./app.state";

registerCard("page", Counter<AppState>({
  value: (s) => s.count,   // state selector — auto-reactive
}));
```

**Handling the emitted event** (`example/src/app.reducer.ts`):

```ts
import {onCounterChanged} from "./counter.card";

register((r) => {
  onCounterChanged<AppState>(r, (state, {value}) => {
    state.count = value;   // raw button clicks never surface here — encapsulated
  });
});
```

### Key API reference for meta cards

| Symbol | Source | Purpose |
|---|---|---|
| `registerMetaCard(opts)` | `@pihanga2/core` | Registers a mapper as a named card type |
| `PiRegisterMetaCard` | `@pihanga2/core` | Type for the `opts` object (use `satisfies`) |
| `MetaCardMapperF` | `@pihanga2/core` | Type of the mapper function |
| `RegisterCardF` | `@pihanga2/core` | Type of the `registerCard` arg inside the mapper |
| `PiMapProps<Props, State, Ctx>` | `@pihanga2/core` | Prop type inside the mapper (each prop may be a state selector) |
| `resolve(prop)` | `StateMapperContext` | Unwraps a lazy prop value inside a child card's prop function |
| `onClickedMapper` / `on*Mapper` | any card | Event mapper suffix — re-maps a child card's action to a different action type |

### Patterns to know

**Lazy prop propagation with `resolve`**

When a meta card receives `value: (s) => s.count` (a state selector), child
cards can't use that selector directly — it has to be unwrapped at the time the
child's own prop function runs:

```ts
// ❌ Doesn't work — selector is passed as-is; child sees a function, not a number
Typography({ text: props.value })

// ✅ Correct — resolve() unwraps the selector inside the child's prop function
Typography({ text: (_, {resolve}) => `Count: ${resolve(props.value)}` })
```

**Event remapping with `onXxxMapper`**

Every card that emits an event supports an `on<EventName>Mapper` prop.  The
mapper intercepts the raw event and returns a different action (or `null` to
suppress):

```ts
Button({
  label: "Save",
  // Re-map generic click → domain-specific action
  onClickedMapper: (_ev, _ctx) => ({ type: MY_ACTION.SAVED }),
})
```

**Registering a stable child card name**

Pass the result of `registerCard(name, def)` as a child in the `content` array.
This is optional but gives the child a stable registry identity:

```ts
const saveBtn = registerCard("save-btn", Button({label: "Save", …}));
return Stack({ content: [saveBtn] });
```

**Accessing metacard context from a deeply nested child**

Use `metaCtxtProps` in a child card's state mapper when you need the context
props that were passed to the meta card's top-level card:

```ts
// Inside a child card declaration within the mapper:
properties: (s, { metaCtxtProps }) => metaCtxtProps.elementData.properties,
```

---

## ⚠️ Hard constraints before you write a single line (primitive cards)


1. **`src/components/` is read-only.** It is managed exclusively by the shadcn
   CLI (`npx shadcn@latest add <name>`).  Never create or edit files there.
   All custom code belongs in `src/cards/<cardName>/`.

2. **Never use `children` as a prop name.** It conflicts with React's type
   system.  Use `content`, `contentCard` (a `PiCardRef`), or `items` instead.

3. **`@pihanga2/core` and React are always available** — never list them in
   `dependencies.json`.

4. **Every card folder must have a `dependencies.json`** — even if the card has
   no external dependencies (use `{}`-valued sections as an explicit "none").

5. **Form-aware input cards must use `useFormContext()`** — see
   [Form-aware inputs](#form-aware-input-cards) below.

---

## Standard card folder layout

```
src/cards/<cardName>/
  index.ts                  # registration entry-point + re-exports
  <cardName>.types.ts       # card id, Props, Events, action/event wiring
  <cardName>.component.tsx  # React implementation (PiCardProps)
  <cardName>.example.ts     # playground definition (STRONGLY recommended)
  dependencies.json         # required — npm deps beyond core/react
  <cardName>.css            # optional local styles
  <cardName>.test.tsx       # optional unit tests
```

The minimum viable card is: `index.ts` + `*.types.ts` + `*.component.tsx` +
`dependencies.json`.

---

## Step-by-step checklist for a new card

### 1 — Choose a card name (string id)

Pick a stable string constant.  Convention: `"shad/<cardName>"` for cards in
this repo (lower-case, slash-separated).

```ts
// src/cards/myCard/myCard.types.ts
export const MY_CARD = "shad/my-card";
```

This string must match the `name` passed to `registerCardComponent` and the
`cardId` in the example file.

---

### 2 — Define Props and Events (`*.types.ts`)

> **Rule: Card Props must only contain basic data types.**
>
> All props in a `CardProps` type must be JSON-serialisable primitives
> (`string`, `number`, `boolean`, `null`) or plain objects / arrays composed
> exclusively of those primitives.  **Never put library interfaces, class
> instances, or opaque objects (e.g. `StreamParser`, `Extension[]`, `RegExp`,
> `Date`) directly in a props type.**  Pihanga serialises card state through
> Redux; non-serialisable values break time-travel debugging, HMR, and the
> playground.
>
> When a card genuinely needs a complex third-party value (a parser, a theme
> extension, a set of keymaps…) use the **registry pattern** described below.

#### Registry pattern for complex prop values

1. **Create a module-level registry** (a plain `Map`) keyed by a `string`.
2. **Export a `register*` function** so callers can inject their value before
   mounting the card.
3. **Use the string key as the prop** — the component looks the value up at
   render time.

**Example — `StreamParser` for the CodeMirror card:**

```ts
// codeMirror.types.ts  (public API)

/** Keys are arbitrary caller-chosen strings; values are StreamParsers. */
const streamParserRegistry = new Map<string, StreamParser<unknown>>();

/** Call this once at app initialisation time, before the card is rendered. */
export function registerStreamParser(key: string, parser: StreamParser<unknown>) {
  streamParserRegistry.set(key, parser);
}

/** Internal — used only by the component. */
export function resolveStreamParser(key: string): StreamParser<unknown> | undefined {
  return streamParserRegistry.get(key);
}

export type CodeMirrorCardProps = {
  value?: string;
  readOnly?: boolean;
  /**
   * Key of a StreamParser previously registered with `registerStreamParser()`.
   * @example
   * import { python } from "@codemirror/legacy-modes/mode/python";
   * registerStreamParser("python", python);
   * CodeMirrorCard({ streamLanguage: "python", value: "print('hello')" });
   */
  streamLanguage?: string;    // ✅ plain string — not StreamParser<unknown>
  extensionsKey?: string;     // ✅ plain string — not Extension[]
};
```

```ts
// At app initialisation (e.g. app.pihanga.ts or a dedicated setup file):
import { python } from "@codemirror/legacy-modes/mode/python";
import { registerStreamParser } from "@pihanga2/shadcn/codeMirror";

registerStreamParser("python", python);
```

```tsx
// codeMirror.component.tsx — look up at render time:
import { resolveStreamParser } from "./codeMirror.types";

const parser = props.streamLanguage
  ? resolveStreamParser(props.streamLanguage)
  : undefined;
const extensions = parser ? [StreamLanguage.define(parser)] : [];
```

The same pattern applies to **`Extension[]`** or any other opaque type.
Register a named bundle of extensions once; reference it by key in props.

**Quick checklist:**

| Prop value | Allowed directly in Props? | Alternative |
|---|---|---|
| `string`, `number`, `boolean` | ✅ | — |
| Plain `Record<string, string>` | ✅ | — |
| `StreamParser<T>`, `Extension` | ❌ | Registry pattern (string key) |
| `RegExp` | ❌ | Pass `string`; compile inside component |
| `Date` | ❌ | Pass ISO string; parse inside component |
| React component / function | ❌ | Reference an existing card type string |


A typical types file has five parts:

#### a) Card declaration factory

```ts
import {createCardDeclaration} from "@pihanga2/core";

export const MyCard = createCardDeclaration<MyCardProps, MyCardEvents>(MY_CARD);
```

This creates the factory callers use: `MyCard({ label: "Hi" })`.

#### b) Actions the card can emit

```ts
import {registerActions} from "@pihanga2/core";

export const MY_CARD_ACTION = registerActions(MY_CARD, ["clicked", "changed"]);
```

#### c) Event payload types

```ts
export type MyCardClickedEvent = { id?: string };
export type MyCardChangedEvent = { id?: string; value: string };
```

#### d) Typed `onXxx` consumer helpers

```ts
import {createOnAction} from "@pihanga2/core";

export const onMyCardClicked = createOnAction<MyCardClickedEvent>(
  MY_CARD_ACTION.CLICKED,
);
export const onMyCardChanged = createOnAction<MyCardChangedEvent>(
  MY_CARD_ACTION.CHANGED,
);
```

#### e) Props and Events types

```ts
export type MyCardProps = {
  id?:      string;
  label:    string;
  disabled?: boolean;
  // ⚠️ Do NOT use `children` — use `content` or `contentCard` instead
};

export type MyCardEvents = {
  onClicked: MyCardClickedEvent;
  onChanged: MyCardChangedEvent;
};
```

---

### 3 — Implement the React component (`*.component.tsx`)

```tsx
import React from "react";
import {PiCardProps} from "@pihanga2/core";
import type {MyCardProps, MyCardEvents} from "./myCard.types";

export const MyCardComponent = (
  props: PiCardProps<MyCardProps, MyCardEvents>,
) => {
  const {cardName, id, label, disabled, onClicked} = props;

  return (
    <div data-pihanga={cardName}>   {/* always set data-pihanga for debugging */}
      <button
        disabled={disabled}
        onClick={() => onClicked({id})}
      >
        {label}
      </button>
    </div>
  );
};
```

Key rules:
- Always set `data-pihanga={cardName}` on the outermost DOM element.
- Render nested cards with `<Card cardName={ref} parentCard={cardName} />`
  (import `Card` from `@pihanga2/core`).
- Call event callbacks (`onClicked`, etc.) directly — Pihanga dispatches the
  corresponding Redux action automatically.

#### Rendering a nested card

```tsx
import {Card} from "@pihanga2/core";
import type {PiCardRef} from "@pihanga2/core";

// In props: contentCard?: PiCardRef
<Card cardName={contentCard} parentCard={cardName} />
```

---

### 4 — Register the card (`index.ts`)

```ts
import {registerCardComponent, actionTypesToEvents} from "@pihanga2/core";
import {MyCardComponent} from "./myCard.component";
import {MY_CARD, MY_CARD_ACTION} from "./myCard.types";

export * from "./myCard.types";

registerCardComponent({
  name:      MY_CARD,
  component: MyCardComponent,
  events:    actionTypesToEvents(MY_CARD_ACTION),
});
```

For a card with no events, omit the `events` field:

```ts
registerCardComponent({name: MY_CARD, component: MyCardComponent});
```

For cards needing global initialisation (plugin registries, etc.), use
`register(...)` instead:

```ts
import {register} from "@pihanga2/core";

register((r) => {
  registerCardComponent({name: MY_CARD, component: MyCardComponent, events: ...});
  // additional global setup…
});
```

---

### 5 — Create `dependencies.json` (required)

List every npm package **directly imported** by any `.ts`/`.tsx` file in the
card folder.  Exclude `@pihanga2/core`, `react`, `react-dom`, and
path-aliased local files.

```json
{
  "dependencies": {
    "some-package": "^1.2.3"
  },
  "devDependencies": {}
}
```

For a card with no external deps:

```json
{
  "dependencies": {},
  "devDependencies": {}
}
```

**Auto-generate / update all cards at once:**

```sh
yarn gen-card-deps            # update all cards
yarn gen-card-deps --dry-run  # preview without writing
yarn gen-card-deps --card myCard  # single card only
```

> If the script reports `UNKNOWN - add to root package.json`, the package is
> missing from the root `package.json` — add it there first, then re-run.

---

### 6 — Create the playground example (`*.example.ts`) — strongly recommended

A card without an `*.example.ts` **does not appear in the playground**.

```ts
import {definePlayground} from "@/playground/definePlayground";
import {MyCard, onMyCardClicked, type MyCardProps} from "./index";

export default definePlayground<MyCardProps>({
  // ── Required ─────────────────────────────────────────────────────────
  cardId:       "shad/my-card",
  title:        "My Card",
  introduction: `
One-sentence summary of what this card does.

When to use it, what it supports, any important constraints or gotchas.
  `.trim(),

  // ── Live preview ─────────────────────────────────────────────────────
  preview:      (props) => MyCard(props),
  defaultProps: { label: "Hello" },   // must be JSON-serialisable (no memo)

  // ── Usage scenarios (tabs) ───────────────────────────────────────────
  facets: [
    {
      id:          "basic",
      title:       "Basic",
      description: "The most common usage — plain label with default styling.",
      props:       { label: "Hello" },
    },
    {
      id:          "disabled",
      title:       "Disabled",
      description: "Use when the action is not currently available.",
      props:       { label: "Unavailable", disabled: true },
    },
  ],

  // ── Interactive prop editor ───────────────────────────────────────────
  controls: [
    { prop: "label",    type: "text",    label: "Label",    placeholder: "Card text…" },
    { prop: "disabled", type: "boolean", label: "Disabled" },
  ],

  // ── Event logging (omit if no events) ────────────────────────────────
  registerEvents: (r, logEvent) => {
    onMyCardClicked(r, (state, ev) => {
      logEvent(state, "onMyCardClicked", { id: ev.id });
    });
  },

  // ── Copy-paste usage snippet ──────────────────────────────────────────
  note: `
\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {MyCard, onMyCardClicked} from "@/cards/myCard";

register((r) => {
  onMyCardClicked(r, (state, {id}) => {
    if (id === "save") state.isSaving = true;
  });
});

registerCard("myApp/widget", MyCard({
  id:    "save",
  label: "Save",
}));
\`\`\`
  `.trim(),
});
```

#### `definePlayground` field reference

| Field | Required | Purpose |
|---|---|---|
| `cardId` | ✅ | Must match the card's `CARD_ID` constant |
| `title` | ✅ | Human-readable name shown in the sidebar |
| `introduction` | ✅ | Markdown prose — what it is, when to use it, gotchas |
| `preview` | ✅ | Factory for the live preview: `(props) => MyCard(props)` |
| `defaultProps` | ✅ | JSON-serialisable initial prop values (no `memo()`) |
| `facets` | Recommended | Named usage scenarios (3–6 tabs) |
| `controls` | Recommended | Interactive prop editor entries |
| `note` | Recommended | Copy-paste `registerCard(...)` snippets |
| `registerEvents` | If card emits events | Log every `onXxx` handler via `logEvent` |

Control types: `"text"`, `"boolean"`, `"token"` (enum picker), `"number"`.
Use dot notation for nested props: `"opts.variant"`.

---

## Form-aware input cards

Any card that acts as a form input (text field, select, checkbox, etc.) **must**
work both inside and outside a `pi/form` card.

```tsx
import {useFormContext} from "@/cards/form/form.context";

export const MyInputComponent = (props: PiCardProps<MyInputProps, MyInputEvents>) => {
  const {name, value: propValue, onChanged} = props;

  const form       = useFormContext();          // always safe to call
  const useFormData = form.isInForm && Boolean(name);

  const value = useFormData
    ? ((form.formData[name!] as string | undefined) ?? "")
    : propValue;

  function handleChange(newValue: string) {
    if (useFormData) {
      form.handleChange(name!, newValue);       // update form state
    } else {
      onChanged({name, value: newValue});       // dispatch Pihanga event
    }
  }

  return <input value={value} onChange={e => handleChange(e.target.value)} />;
};
```

`useFormContext()` fields:

| Field | Type | Purpose |
|---|---|---|
| `isInForm` | `boolean` | `true` when inside a `pi/form` card |
| `formData` | `Record<string, unknown>` | Current field values keyed by `name` |
| `errors` | `Record<string, string>` | Validation errors keyed by `name` |
| `handleChange` | `(field, value) => void` | Push a new field value |
| `setError` | `(field, error \| null) => void` | Set or clear a validation error |

Rules:
- **Always call `useFormContext()`** unconditionally — it is a no-op outside a form.
- **Gate on `isInForm && Boolean(name)`** before using form data.
- **Always include `name?: string` in the Props type** to allow form participation.
- See `src/cards/textField/textField.component.tsx` and
  `src/cards/checkbox/checkbox.component.tsx` for complete working examples.

---

## Where to look for real examples

| Need | Card to study |
|---|---|
| **Meta card (composition)** | **`example/src/counter.card.ts`** — fully annotated: Stack + Button × 2 + Typography, event remapping, `resolve()`, stable child names |
| Minimal primitive card structure | `src/cards/emptyCard.tsx` |
| Button with variants, icons, tooltip | `src/cards/button/` |
| Dropdown / context menu | `src/cards/dropDownMenu/` |
| Form input pattern | `src/cards/textField/`, `src/cards/checkbox/` |
| Layout card composing children | `src/cards/flexGrid/`, `src/cards/stack/` |
| Card with local CSS | `src/cards/pasteTarget/` |
| Card with Radix `asChild` | `src/cards/dropDownMenu/` |

---

## After building the card — publish checklist

- [ ] `dependencies.json` exists and is accurate (`yarn gen-card-deps --card <name>`)
- [ ] `*.example.ts` created with `introduction`, `preview`, `defaultProps`, at
      least two `facets`, and `registerEvents` if the card emits actions
- [ ] Card appears in the playground (run `yarn dev` and navigate to the explorer)
- [ ] `make gen-registry` runs without errors and emits a valid `public/r/<cardName>.json`
- [ ] No files added to `src/components/`

---

## Related files

- `src/playground/playground.pihanga.ts` — how cards are wired into the playground app
- `src/app.pihanga.ts` — top-level frame/page setup (reference for `registerFramework`)
- `src/cards/BUILDING_CARDS_HOWTO.md` — human-oriented narrative version of this guide
- `scripts/gen-card-dependencies.mjs` — dependency scanner
- `scripts/gen-registry.mjs` — registry builder

---

## Theme-aware cards — working with CSS variables

shadcn/ui components (and therefore pihanga-shadcn cards built on top of them)
use **CSS custom properties** for all semantic colours, radii, and shadows.
Understanding the token system is essential for cards that carry their own
visual chrome (borders, backgrounds, elevation).

### How the token system works

`src/theme.css` (shipped as `@pihanga2/shadcn/theme.css`) defines three layers:

| Layer | Purpose | Example |
|---|---|---|
| `:root { --card: oklch(...) }` | **Palette** — raw colour values | `--card`, `--border`, `--radius` |
| `@theme inline { --color-card: var(--card) }` | **Tailwind mapping** — wires vars to utility classes | `bg-card`, `border-border`, `rounded-xl` |
| `.dark { --card: oklch(...) }` | **Dark-mode overrides** | Same tokens, different values |

A consumer who overrides `:root { --card: oklch(0.9 0 0); }` in their own CSS
automatically rethemes every card that uses `bg-card` — no card code changes
needed.

### Using theme tokens in a new card

**Prefer shadcn semantic tokens over hardcoded colours.** This makes the card
rethemable by the consumer:

```tsx
// ✅ Rethemable — uses CSS variable tokens
<div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm">

// ❌ Hard-wired — ignores consumer theme
<div className="bg-white text-gray-900 border border-gray-200 rounded-xl shadow-sm">
```

Standard shadcn tokens available as Tailwind utilities:

| Tailwind class | CSS variable | Default (light) |
|---|---|---|
| `bg-card` | `--card` | white |
| `text-card-foreground` | `--card-foreground` | near-black |
| `bg-background` | `--background` | white |
| `text-foreground` | `--foreground` | near-black |
| `bg-muted` | `--muted` | light gray |
| `text-muted-foreground` | `--muted-foreground` | medium gray |
| `bg-primary` | `--primary` | dark |
| `text-primary-foreground` | `--primary-foreground` | near-white |
| `border-border` | `--border` | light gray |
| `rounded-xl` | `--radius-xl` = `--radius + 4px` | ~14px |
| `rounded-lg` | `--radius-lg` = `--radius` | 10px |
| `shadow-sm` | Tailwind built-in | subtle shadow |

### Adding a new theme token for a card

When a card needs a design token consumers can override (e.g. a brand-specific
colour or radius), add it to **`src/theme.css`** following the same pattern:

```css
/* In src/theme.css — @theme inline block */
@theme inline {
  /* … existing tokens … */
  --color-my-card-accent: var(--my-card-accent);
}

/* default in :root */
:root {
  --my-card-accent: oklch(0.5 0.2 260);   /* a blue */
}
```

Then use `bg-my-card-accent` / `text-my-card-accent` in your component.
Consumers override by setting `--my-card-accent` in their own `:root`.

> **Do not** add tokens that are only useful for a single card to the global
> `theme.css`.  For card-local defaults, prefer explicit Tailwind colour classes
> or a `className` prop.

### The `@container` gotcha with shadcn composites

shadcn's `<CardHeader>` applies `@container/card-header`
(`container-type: inline-size`).  CSS containment makes the element's
intrinsic inline size appear as **0** to its parent for `min-width` / `max-content`
calculations — your card will collapse to a tiny width if it relies on `min-w-max`.

**Fix:** replace `<CardHeader>` with a plain `<div data-slot="card-header">` that
carries the same Tailwind classes but without the `@container` prefix:

```tsx
// ❌ @container breaks min-w-max on the parent Card
<CardHeader className={headerClassName}>

// ✅ Same visual styles, no CSS containment
<div
  data-slot="card-header"
  className={cn(
    "grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6",
    "has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
    headerClassName,
  )}
>
```

This is safe because the `has-data-[slot=card-action]` selector is a CSS `:has()`
rule, not a container query — it doesn't require `@container` to function.

### Consumer setup (reminder)

Cards in this library render correctly only when the consuming app's CSS
includes `@import "@pihanga2/shadcn/theme.css"`.  That single import:

1. Defines the CSS custom property palette (`:root`, `.dark`)
2. Maps them to Tailwind v4 utility tokens (`@theme inline`)
3. Tells Tailwind to scan the library's compiled files (`@source "."`)

Apps that already use shadcn/ui with their own theme setup do not need the
import — their `:root` variables cascade over the defaults.
