# Building Pihanga Cards (JOWTO)

This repo uses **Pihanga** as a *declarative card system*.

At a high level:

* A **card** is identified by a string (e.g. `"pi/button"`, `"plateEditor"`).
* A card has **props** (serialisable data/config), and optional **events** (callbacks that dispatch typed actions).
* A card is **declared** with `createCardDeclaration(...)` and **registered** with `registerCardComponent(...)` so the runtime can render it.
* Cards are **composed** by referencing other cards using `PiCardRef` (a string reference) and rendering them with `<Card cardName={...} />`.

This document describes the components and code artifacts typically required to build a card by analysing `src/pihanga/`.

> Note: ignore `src/pihanga/shadcn/` — it contains a parallel set of wrappers and doesn’t define the core patterns.

---

## Where cards are used (composition)

Cards are assembled into pages by registering **card instances** (declarations) against a card name.

Example: `src/pages/frame/frame.pihanga.ts`

* `registerFramework(...)` registers the top-level “app shell” card.
* `registerCard(cardName, CardDeclaration({...}))` registers concrete card instances.
* Cards often reference other cards by returning a `PiCardRef` from a selector function (state-driven card composition).

You’ll see card composition using Pihanga’s `<Card />` component:

* `src/pihanga/pageWithNavbar/pageWithNavbar.component.tsx` renders `topLeftCard`, `topRightCard`, `main`, `footer` by doing:
  * `<Card cardName={...} parentCard={cardName} />`
* `src/pihanga/flexGrid/flexGrid.component.tsx` renders a map of cards into a CSS grid.
* `src/pihanga/stack/stack.component.tsx` renders a vertical/horizontal list of cards.

---

## The “standard card folder” pattern

Most cards under `src/pihanga/` follow this layout:

```
src/pihanga/<cardName>/
  index.ts                # registration + re-exports
  <card>.types.ts         # card id, props/events types, action/event wiring
  <card>.component.tsx    # React implementation using PiCardProps
  <card>.css              # optional local styles (imported by component)
  <card>.example.ts       # optional example props for demos/dev
  <card>.test.tsx         # optional unit tests
  dependencies.json       # required – lists npm packages needed by this card
```

Every card folder **must** include a `dependencies.json` file that declares the
npm packages required by the card (beyond `@pihanga2/core` and React, which are
always available).  The format mirrors the relevant sections of `package.json`:

```json
{
  "dependencies": {
    "some-package": "^1.2.3"
  },
  "devDependencies": {}
}
```

Use an empty object (`{}`) for a section when the card has no packages in that
category.  This file is the authoritative record of the card's external
dependencies and must be kept in sync whenever imports change.

Concrete examples:

* Button card: `src/pihanga/button/`
* Dropdown card: `src/pihanga/dropDownMenu/`
* Paste target card: `src/pihanga/pasteTarget/`
* SPARQL editor card: `src/pihanga/sparqlEditor/`

Not every card has every artifact, but `index.ts` + `*.component.tsx` + `*.types.ts` is the common baseline.

---

## 1) Choose a card name (string id)

The card id is a string constant. Examples:

* `src/pihanga/button/button.types.ts`: `export const PI_BUTTON_CARD = "pi/button";`
* `src/pihanga/dropDownMenu/drop-down.types.ts`: `export const DROP_DOWN_MENU_CARD = "pi/drop-down-menu";`
* `src/pihanga/plateEditor/plate.types.ts`: `export const PLATE_EDITOR_CARD = "plateEditor";`

This name must match what you pass to `registerCardComponent({ name: ... })`.

---

## 2) Define props/events (types file)

Typical contents of `*.types.ts`:

### a) Card declaration factory

Use `createCardDeclaration<Props, Events>(CARD_ID)` to create a function that produces a **card definition**.

Example (`src/pihanga/button/button.types.ts`):

```ts
export const Button = createCardDeclaration<PiButtonProps, PiButtonEvents>(
  PI_BUTTON_CARD,
);
```

This lets you create card instances declaratively:

```ts
const avatarButton = Button({ label: "M", opts: { size: "icon" } });
```

### b) Actions ↔ events (Redux) mapping (important)

In this codebase, cards communicate outward by **dispatching redux actions** through Pihanga’s dispatcher.

The **types file** defines the bridge between:

* **Actions**: the string action types the card can emit (registered once per card type)
* **Events**: typed payloads that correspond to those actions
* **Event callbacks on `PiCardProps`**: functions your component calls, which dispatch the corresponding action

The pattern looks like this:

1) **Define the set of actions your card can emit** with `registerActions(cardId, ["..."])`.

Example (`src/pihanga/button/button.types.ts`):

```ts
export const PI_BUTTON_ACTION = registerActions(PI_BUTTON_CARD, ["clicked"]);
```

2) **Define an Event payload type per action**.

Example:

```ts
export type PiButtonClickedEvent = {
  id?: string;
};
```

3) **Create typed `onXxx` helpers** with `createOnAction(actionType)`.

These are used by *consumers* (reducers, effects, page wiring, etc.) to react to actions.

Example:

```ts
export const onPiButtonClicked = createOnAction<PiButtonClickedEvent>(
  PI_BUTTON_ACTION.CLICKED,
);
```

4) **Expose a “union” Events type** mapping each event callback name to its payload type.

Example:

```ts
export type PiButtonEvents = {
  onClicked: PiButtonClickedEvent;
};
```

5) **Wire actions to event callback props when registering the card**.

In `index.ts`, registration uses `actionTypesToEvents(...)` so Pihanga can provide event handler props on `PiCardProps`.

Example (`src/pihanga/button/index.ts`):

```ts
registerCardComponent({
  name: PI_BUTTON_CARD,
  component: ButtonComponent,
  events: actionTypesToEvents(PI_BUTTON_ACTION),
});
```

6) **Inside the component implementation, call the event callback**.

That callback is the “key” that triggers dispatch of the underlying redux action.

Example (`src/pihanga/button/button.component.tsx`):

```ts
const handleClick = () => {
  onClicked({id});
};
```

7) **Process the emitted actions** elsewhere.

You can handle these actions using reducers registered with Pihanga (e.g. via `usePiReducer(...)` as seen in `src/pihanga/plateEditor/plate.component.tsx`).

So, conceptually:

*Component calls* `props.onClicked(payload)` → *Pihanga dispatches* `{ type: "pi/button/clicked", ...payload }` (shape depends on core) → *your reducer/effect* handles it.

### d) Props shape

Props should be serialisable (or at least declarative). Patterns used here:

* Use `PiCardRef` for nested cards (strings referencing other cards)
  * e.g. `DropDownMenuProps.trigger: PiCardRef`
  * e.g. `PiButtonProps.contentCard?: PiCardRef`
* Support both "simple" and "composed" content:
  * `type MenuContent = string | PiCardRef;` (`drop-down.types.ts`)
* Allow styling via `className` and/or structured `style` objects.

### e) ⚠️ Reserved prop name: `children`

**Do NOT use `children` as a prop name in any `...Props` type.**

`children` is a reserved word in React's type system (`React.PropsWithChildren`). Declaring it explicitly in your props interface causes type conflicts and runtime errors. If you need to pass child content, use a different name such as `content`, `contentCard` (a `PiCardRef`), or `items`.

```ts
// ❌ BAD – conflicts with React internals
export type MyCardProps = {
  children: string;
};

// ✅ GOOD – use a different name
export type MyCardProps = {
  content: string;
};
```

---

## 3) Implement the React component (`*.component.tsx`)

Card components in this directory are ordinary React components, but they receive **Pihanga-wired props**:

* `PiCardProps<Props, Events>` from `@pihanga2/core`

Common fields used across components:

* `cardName`: the resolved card instance name.
* `_cls(...)`: helper used by many cards to build consistent class names.
* event callbacks like `onClicked`, `onSelected`, `onRun`, etc.

Examples:

* `src/pihanga/button/button.component.tsx`
  * emits `onClicked({id})` when clicked
  * uses `data-pihanga={cardName}` on the DOM root for debugging/testing
  * composes nested content with `<Card cardName={content} parentCard={cardName} />`

* `src/pihanga/dropDownMenu/drop-down.component.tsx`
  * wraps the trigger in a real DOM element because Radix `asChild` requires prop forwarding
  * supports nested cards for labels/items via `MenuContent` and `contentToNode(...)`
  * demonstrates a common “model → render” approach for declarative menu structures

* `src/pihanga/pasteTarget/pasteTarget.component.tsx`
  * imports local CSS: `import "./pasteTarget.css";`
  * emits `onPastedContent({ items })`

### Rendering nested cards

To render a referenced card, use:

```tsx
import {Card} from "@pihanga2/core";

<Card cardName={somePiCardRef} parentCard={cardName} />
```

If your third-party UI library requires direct DOM prop/ref forwarding (Radix patterns), you may need a wrapper DOM element (see `dropDownMenu`).

### ⚠️ Form-aware input components (`useFormContext`)

Any card that acts as an **input element** — such as a text field, select, checkbox, radio group, date picker, etc. — **must be designed to work both inside and outside a `pi/form` card**.

The `pi/form` card provides a React context (`FormContext`) that manages form-wide state. Input cards should read from that context when available, and fall back to prop-driven behaviour when used standalone.

**The rule:** use the `useFormContext()` hook from `src/cards/form/form.context.tsx`. It always returns a value: when outside a `<Form>`, `isInForm` is `false` and the other fields are no-ops/empty.

#### Pattern

```tsx
import {useFormContext} from "@/cards/form/form.context";

export const MyInputComponent = (props: PiCardProps<MyInputProps, MyInputEvents>) => {
  const {name, value: propValue, onChanged} = props;

  // 1. Connect to the nearest form (safe to call outside a form too)
  const form = useFormContext();
  const useFormData = form.isInForm && Boolean(name);

  // 2. Derive the effective value:
  //    - inside a form → read from form.formData[name]
  //    - standalone   → use the prop value directly
  const value = useFormData
    ? ((form.formData[name!] as string | undefined) ?? "")
    : propValue;

  // 3. Handle changes:
  //    - inside a form → push the new value into form state
  //    - standalone   → dispatch the Pihanga event callback
  function handleChange(newValue: string) {
    if (useFormData) {
      form.handleChange(name!, newValue);
    } else {
      onChanged({name, value: newValue});
    }
  }

  return <input value={value} onChange={e => handleChange(e.target.value)} />;
};
```

#### What `useFormContext()` provides

| Field | Type | Purpose |
|---|---|---|
| `isInForm` | `boolean` | `true` when rendered inside a `pi/form` card |
| `formData` | `Record<string, unknown>` | Current form field values, keyed by `name` |
| `errors` | `Record<string, string>` | Validation errors, keyed by `name` |
| `handleChange` | `(field, value) => void` | Push a new field value into the form |
| `setError` | `(field, error \| null) => void` | Set or clear a validation error |

#### Key points

* **Always call `useFormContext()`** — it is safe to call unconditionally; outside a form it returns a harmless fallback.
* **Gate on `isInForm && Boolean(name)`** — only use form data when there is actually a form *and* the component has been given a `name` prop.
* **Still dispatch the Pihanga event when standalone** — the `onChanged` (or equivalent) event callback must still work for consumers that use the card outside a form.
* **`name` prop is the form field key** — ensure your props type includes `name?: string` so the component can participate in form state.
* See `src/cards/textField/textField.component.tsx` and `src/cards/checkbox/checkbox.component.tsx` for complete working examples.

---

## 4) Register the card (`index.ts`)

Every card must be registered, typically in the card’s `index.ts`.

### a) Simple registration (most cards)

Pattern:

* re-export types/declarations
* register the component with `registerCardComponent`
* optionally wire events via `actionTypesToEvents(...)`

Example (`src/pihanga/button/index.ts`):

```ts
export * from "./button.types";

registerCardComponent({
  name: PI_BUTTON_CARD,
  component: ButtonComponent,
  events: actionTypesToEvents(PI_BUTTON_ACTION),
});
```

Example without events (`src/pihanga/flexGrid/index.ts`):

```ts
registerCardComponent({ name: FLEX_GRID_CARD, component: FlexGridComponent });
```

### b) Registration with side-effects / init (`register(...)`)

Some cards need *extra initialisation*, not just card registration.

Example: `src/pihanga/plateEditor/index.ts`

* Uses `register((r: PiRegister) => { ... })` to register the card and initialise ops (`op_init()`).
* Re-exports a set of related APIs:
  * `extensions.ts` (plugin/component registries)
  * `operations.ts` (action dispatch helpers)
  * `utils.ts` (paste conversion helpers)

Use this approach if your card module needs to register global handlers, plugin registries, etc.

---

## 5) Optional artifacts

### Examples (`*.example.ts`)

Examples are used to document supported props and provide ready-made demo configs
**and** to capture live card events in the Playground's "Events" panel.

Every `*.example.ts` should export a `definePlayground` default and include:

1. **`facets`** — named usage scenarios (one per tab in the "Examples" section).
2. **`registerEvents`** — event listeners that log every interaction to the
   playground event viewer.

#### The `registerEvents` field

`registerEvents` is an optional field on `definePlayground`. When present, the
Playground engine calls it once at boot-time, passing a scoped `logEvent`
function. The function is a no-op for all cards *except* the one currently
selected in the playground, so registering global handlers here is safe.

```ts
import {Stepper, onStepperStepClicked, type StepperProps} from "./index";
import {definePlayground} from "@/playground/definePlayground";

export default definePlayground<StepperProps>({
  cardId: "shad/stepper",
  title:  "Stepper",
  // …

  registerEvents: (r, logEvent) => {
    // `r`        — PiRegister (same API as inside register((r) => …))
    // `logEvent` — (state, eventLabel, data) => void
    //              appends to state.playgroundEventLog when this card is active
    onStepperStepClicked(r, (state, ev) => {
      logEvent(state, "onStepperStepClicked", {
        stepIndex: ev.stepIndex,
        stepId:    ev.stepId,
      });
    });
  },
});
```

**Rules for `registerEvents`:**

| Rule | Rationale |
|---|---|
| Call `logEvent` from every `onXxx` handler the card can emit | Demonstrates the full event surface in the UI |
| Pass only serialisable `data` values (no `undefined`; use `null` or omit the key) | `data` is shown by `JsonViewer` — `undefined` values are silently dropped by JSON |
| Do **not** mutate state beyond calling `logEvent` | Side-effects belong in the host app's reducers, not in examples |
| List the most important fields, not every field | Keeps the event panel readable |

When `registerEvents` is declared, the Playground automatically splits each
facet tab's bottom row into two columns:
- **Left**: `JsonViewer` for the facet's prop overrides.
- **Right**: scrollable event log (newest first); shows "No events yet" until the user interacts.

Previously:

* `src/pihanga/button/button.example.ts`
  * demonstrates icon registration (`registerIcon(...)`) and typical button props
* `src/pihanga/dropDownMenu/drop-down.example.ts`
  * demonstrates labels, separators, checkboxes, radio groups, submenus

### Tests (`*.test.tsx`)

Tests tend to focus on behaviour and often mock Pihanga core pieces.

Example: `src/pihanga/dropDownMenu/drop-down.component.test.tsx`

* It stubs `@pihanga2/core`’s `<Card />` because the real implementation expects a redux provider.
* This is a common technique for unit testing card components in isolation.

### CSS (`*.css`)

Two patterns appear in this directory:

* Tailwind-first (utility classes in JSX)
  * e.g. `navbarSearch.component.tsx`, `sparqlEditor.component.tsx`
* Local CSS imported by the component
  * `src/pihanga/pasteTarget/pasteTarget.component.tsx` → `src/pihanga/pasteTarget/pasteTarget.css`
  * `src/pihanga/pageWithNavbar/pageWithNavbar.component.tsx` → `src/pihanga/pageWithNavbar/pageWithNavbar.css`

There is also a global-ish stylesheet used by the spec editor viewer:

* `src/pihanga/spec_editor.css`

---

## Cross-cutting utilities in `src/pihanga/`

### `src/pihanga/icons.ts` (icon registry)

Some cards reference icons by name rather than importing icon components directly.

* `registerIcon(IconComponent, "name")` registers an icon once (typically at app init)
* `getIconId(name)` + `getIcon(id)` resolve it

Used by:

* `src/pihanga/button/button.component.tsx` (`opts.iconName`)

### `src/pihanga/emptyCard.tsx` (minimal placeholder)

Defines a simple “empty-card” used as a placeholder in layouts.

This file is a compact reference for the bare minimum:

* `createCardDeclaration(...)`
* a React component using `PiCardProps`
* `registerCardComponent({ name, component })`

---

## Putting it together: checklist for creating a new card

1. **Create a folder**: `src/pihanga/<yourCard>/`
2. **Define types** in `<yourCard>.types.ts`
   * `CARD_ID` string
   * `Props` + `Events`
   * `createCardDeclaration<Props, Events>(CARD_ID)` export
   * optional `registerActions` + `createOnAction`
3. **Implement** `<yourCard>.component.tsx`
   * `export const Component = (props: PiCardProps<Props, Events>) => ...`
   * render `data-pihanga={cardName}` on the root for consistency
   * compose other cards with `<Card />` using `PiCardRef`
4. **Register and export** in `index.ts`
   * `export * from "./<yourCard>.types";`
   * `registerCardComponent({ name: CARD_ID, component: Component, events: ... })`
5. **Create `dependencies.json`** (required)
   * List every npm package imported by the card (excluding `@pihanga2/core` and React)
   * Use the same `dependencies` / `devDependencies` structure as `package.json`
   * Use `{}` for any section that has no entries
6. **Optional**
   * `*.example.ts` with example props
   * `*.test.tsx` (mock `<Card />` if needed)
   * `*.css` imported by the component

---

## Related entry points

* `src/pages/frame/frame.pihanga.ts` – concrete example of wiring cards into the app.
* Other page compositions (examples): `src/pages/refactor/refactor.pihanga.ts`, `src/pages/knowledgeGraph/kg.pihanga.ts`.
* `src/pihanga/index.ts` – historical init entrypoint (currently commented out).
