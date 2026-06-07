# AGENT.building-cards.md — creating new pihanga-shadcn cards

> **Scope:** adding a new card *type* to `src/cards/` in this repository.
> Read [`AGENT.md`](./AGENT.md) first for orientation and universal rules.
> If you only need to *use* existing cards in an app, switch to
> [`AGENT.using-cards.md`](./AGENT.using-cards.md).

---

## ⚠️ Hard constraints before you write a single line

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
| Minimal card structure | `src/cards/emptyCard.tsx` |
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
