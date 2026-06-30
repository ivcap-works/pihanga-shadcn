# Building Pihanga Cards (JOWTO)

This repo uses **Pihanga** as a *declarative card system*.

At a high level:

* A **card** is identified by a string (e.g. `"pi/button"`, `"plateEditor"`).
* A card has **props** (serialisable data/config), and optional **events** (callbacks that dispatch typed actions).
* A card is **declared** with `createCardDeclaration(...)` and **registered** with `registerCardComponent(...)` so the runtime can render it.
* Cards are **composed** by referencing other cards using `PiCardRef` (a string reference) and rendering them with `<Card cardName={...} />`.

This document describes the components and code artifacts typically required to build a card by analysing `src/pihanga/`.

> Note: ignore `src/pihanga/shadcn/` — it contains a parallel set of wrappers and doesn't define the core patterns.

---

## ⚠️ Critical rule: `src/components/` is a shadcn-only zone

> **DO NOT add any custom code to `src/components/`.
> ALL custom code belongs in the card's own directory (`src/cards/<cardName>/`).**

`src/components/` — and especially `src/components/ui/` — is a **read-only, auto-managed directory**
that contains only components fetched from the official shadcn/ui registry or the Plate registry
via `npx shadcn@latest add <name>`.

Violating this rule causes **two serious problems**:

1. **Registry pollution** — `make gen-registry` scans `src/components/ui/` and emits a separate
   `pihanga-ui-extras` registry entry for every non-standard file it finds there.  Custom files end
   up bundled into that entry and shipped to every consumer who installs any Pihanga card — even
   consumers who never use the feature that needed that file.

2. **Upgrade conflicts** — running `npx shadcn@latest add <name>` may silently overwrite your
   custom file, destroying work.

### What to do instead

| Need | Wrong place | Right place |
|------|-------------|-------------|
| A small helper component used only by one card | `src/components/ui/myHelper.tsx` ❌ | `src/cards/<cardName>/myHelper.tsx` ✅ |
| A hook used only by one card | `src/components/hooks/myHook.ts` ❌ | `src/cards/<cardName>/myHook.ts` ✅ |
| Shared types used across many cards | `src/components/ui/types.ts` ❌ | `src/cards/types.ts` ✅ |
| Shared icon utilities | `src/components/ui/icons.ts` ❌ | `src/cards/icons.ts` ✅ |
| A new shadcn primitive you need | — | `npx shadcn@latest add <name>` then commit ✅ |

If a helper is used by **more than one card**, create a dedicated card for it
(e.g. a `utils` or `primitives` card under `src/cards/`) and import it via the `@/cards/` alias.

---

## Where cards are used (composition)

Cards are assembled into pages by registering **card instances** (declarations) against a card name.

Example: `src/app.pihanga.ts`

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
always available).

**Purpose:** `dependencies.json` serves two roles:

1. **Documentation** — it is the single authoritative record of what a consumer
   needs to `npm install` in order to use the card as a standalone module.
   Without it, the required packages are buried in import statements scattered
   across component files.
2. **Tooling** — build scripts (e.g. the playground registry generator) can
   parse these files to automatically derive install instructions, generate
   package manifests, or validate that every imported package is declared.

The format mirrors the relevant sections of `package.json`:

```json
{
  "dependencies": {
    "some-package": "^1.2.3"
  },
  "devDependencies": {}
}
```

**Rules:**

* List every npm package that is **directly imported** by any `.ts` / `.tsx`
  file in the card folder — including local helper files such as
  `dropdown-menu.ui.tsx` that live inside the card directory.
* **Exclude** `@pihanga2/core`, `react`, and `react-dom` — these are always
  provided by the host application.
* **Exclude** path-aliased local files (`@/components/ui/*`, `@/lib/*`, etc.)
  unless the alias resolves to a separate npm package.
* Use an empty object (`{}`) for a section when the card has no packages in
  that category.  Even cards with no external dependencies **must** have the
  file (with both sections set to `{}`), so tooling can confirm the card was
  intentionally analysed.
* Version strings must match the installed version in the root `package.json`
  and must be kept in sync whenever imports change.

**Generating / updating  automatically:**

Run the bundled script to (re-)generate all cards in one pass:

```sh
yarn gen-card-deps            # update all cards
yarn gen-card-deps --dry-run  # preview changes without writing
yarn gen-card-deps --card select  # single card only
```

The script traces both **direct** npm imports and **transitive** imports via
the local shadcn wrapper files (, ).
Any package already in a `dependencies.json` that is not detected by the
scanner is preserved with a warning, so manually-added entries (e.g.
CSS-only packages, dynamic requires) are not lost.

> **Note:** if the script reports `UNKNOWN - add to root package.json` for a
> package, the import is real but the package is missing from the root
> `package.json`.  Add it there first, then re-run the script.

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
export const onButtonClicked = createOnAction<PiButtonClickedEvent>(
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

The example file serves **two equally important purposes**:

1. **Documentation** — it is the primary human-readable description of what the card is,
   when to use it, what variants it supports, and how to wire it into a real app.
2. **Playground integration** — it drives the interactive card explorer: live preview,
   facet tabs, prop controls, and event log.

A card without a `*.example.ts` file does **not appear** in the playground. Strongly
prefer creating one for every new card.

#### Full `definePlayground` schema

```ts
export default definePlayground<MyCardProps>({
  // ── Required ──────────────────────────────────────────────────────────────
  cardId:       "shad/my-card",   // must match the card's CARD_ID constant
  title:        "My Card",        // human-readable name shown in the sidebar
  introduction: `…`,              // prose description — see below (REQUIRED)

  // ── Strongly recommended ──────────────────────────────────────────────────
  preview:      (props) => MyCard(props),   // factory for the live preview
  defaultProps: { label: "Hello" },         // JSON-serialisable defaults for the live preview
  facets: [ … ],                            // named usage scenarios — see below
  controls: [ … ],                          // interactive prop controls — see below
  note:    `…`,                             // usage code for app.pihanga.ts — see below

  // ── Optional ──────────────────────────────────────────────────────────────
  registerEvents: (r, logEvent) => { … },   // event logging — see below
});
```

---

#### `introduction` (required)

`introduction` is the **card's primary documentation**. It is enforced as required
by `definePlayground` — the function throws at module load if it is absent.

Write it as plain markdown. It should answer:

- **What is this card?** One-sentence summary.
- **When should I use it?** Typical use-cases or scenarios.
- **What are its key capabilities?** Notable features, variants, or behaviours.
- **Any important constraints or gotchas?** e.g., "must be inside a `pi/form` card",
  "requires icon registration", "uses Tailwind v4 only".

```ts
introduction: `
A versatile, Tailwind-styled button with support for multiple **variants**, **sizes**,
icons, tooltips, and loading states.

Set \`opts.variant\` to control the visual style, and \`opts.size\` to control dimensions.
Use \`iconLabel\` for icon-only buttons, or \`opts.beforeIcon\` / \`opts.afterIcon\` to
place icons alongside text labels.

Tooltips accept either a plain string (\`tooltip\`) or any \`PiCardRef\` (\`tooltipCard\`)
for rich custom tooltip content.
`.trim(),
```

Keep `introduction` data-only — no `memo()` calls, no function references.

---

#### `preview` and `defaultProps`

`preview` is a factory function that returns the card declaration rendered in the
live preview pane. `defaultProps` provides the initial JSON-serialisable prop values.

```ts
preview:      (props) => Button(props),
defaultProps: { id: "preview", label: "Click me", opts: { variant: "default" } },
```

`defaultProps` is validated at dev time — if it contains non-serialisable values
(e.g. a `memo()` wrapper), `definePlayground` throws immediately.

---

#### `facets`

Facets are named usage scenarios shown as tabs in the playground. Each facet must
have:

| Field | Required | Purpose |
|---|---|---|
| `id` | ✅ | Unique slug (URL-safe) |
| `title` | ✅ | Tab label |
| `description` | ✅ | One-sentence explanation of *when* to use this variant — shown below the tab title |
| `props` | ✅ | JSON-serialisable props merged over `defaultProps` for this scenario |

```ts
facets: [
  {
    id:          "default",
    title:       "Default",
    description: "Primary colour, filled. Use for the most prominent or active state.",
    props:       { label: "New", variant: "default" },
  },
  {
    id:          "destructive",
    title:       "Destructive",
    description: "Red / error colour. Use for failed, blocked, or dangerous states.",
    props:       { label: "Error", variant: "destructive" },
  },
],
```

Aim for 3–6 facets. Cover the most common real-world scenarios rather than
enumerating every prop combination.

---

#### `controls`

Controls render an interactive prop editor in the playground sidebar. Supported
control types:

| `type` | Renders | Use for |
|---|---|---|
| `"text"` | Text input | String props; supports `placeholder` |
| `"boolean"` | Toggle switch | Boolean props |
| `"token"` | Segmented button group | Enum/union props; requires `options` array |
| `"number"` | Number input | Numeric props |

```ts
controls: [
  { prop: "label",       type: "text",    label: "Label",   placeholder: "Button text…" },
  { prop: "opts.variant",type: "token",   label: "Variant", options: ["default", "secondary", "ghost"] },
  { prop: "opts.size",   type: "token",   label: "Size",    options: ["default", "sm", "lg", "icon"] },
  { prop: "disabled",    type: "boolean", label: "Disabled" },
  { prop: "loading",     type: "boolean", label: "Loading"  },
],
```

Use dot notation for nested props (`"opts.variant"`). Match the `prop` path exactly
to the card's Props type.

---

#### `note`

`note` is a markdown string (rendered below the live preview) containing **copy-paste
usage snippets** showing how to wire the card in a real `app.pihanga.ts`. Include at
least one `registerCard(...)` example; add more snippets for common patterns (e.g.
state-driven props, event handlers).

```ts
note: `
Inside \`app.pihanga.ts\`, wire a button to dispatch an action:

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {Button, onButtonClicked} from "@/cards/button";

register((r) => {
  onButtonClicked(r, (state, {id}) => {
    if (id === "save") state.isSaving = true;
  });
});

registerCard("myApp/saveButton", Button({
  id:    "save",
  label: "Save",
  opts:  { variant: "default" },
}));
\`\`\`
`.trim(),
```

Rules for `note`:
- Use triple-backtick TypeScript blocks — they are syntax-highlighted.
- Show realistic prop values, not `"TODO"` placeholders.
- If the card has form integration, show both the form-bound and standalone patterns.
- Keep it concise: 1–3 snippets covering the most important use-cases.

---

#### `registerEvents`

`registerEvents` is an optional field. When present, the Playground engine calls it
once at boot-time, passing a scoped `logEvent` function. The function is a no-op for
all cards *except* the one currently selected, so registering global handlers here
is safe.

```ts
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

---

#### Complete example file skeleton

```ts
/**
 * Playground definition for the `shad/my-card` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {MyCard, onMyCardAction, type MyCardProps} from "./index";

export default definePlayground<MyCardProps>({
  cardId: "shad/my-card",
  title:  "My Card",

  introduction: `
One-sentence summary of what this card does.

When to use it, what it supports, any important constraints.
  `.trim(),

  preview:      (props) => MyCard(props),
  defaultProps: { label: "Hello" },

  facets: [
    {
      id:          "basic",
      title:       "Basic",
      description: "The most common usage — plain label with default styling.",
      props:       { label: "Hello" },
    },
    {
      id:          "variant-b",
      title:       "Variant B",
      description: "When to prefer this variant over the default.",
      props:       { label: "World", variant: "secondary" },
    },
  ],

  controls: [
    { prop: "label",   type: "text",    label: "Label",   placeholder: "Card text…" },
    { prop: "variant", type: "token",   label: "Variant", options: ["default", "secondary"] },
    { prop: "disabled",type: "boolean", label: "Disabled" },
  ],

  registerEvents: (r, logEvent) => {
    onMyCardAction(r, (state, ev) => {
      logEvent(state, "onMyCardAction", { id: ev.id });
    });
  },

  note: `
\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {MyCard} from "@/cards/myCard";

registerCard("myApp/widget", MyCard({
  label: "Hello",
}));
\`\`\`
  `.trim(),
});
```

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
6. **Create `*.example.ts`** (strongly recommended — cards without one are invisible in the playground)
   * Required fields: `cardId`, `title`, `introduction`
   * `introduction` — prose description of what the card is, when to use it, key capabilities
   * `preview` + `defaultProps` — live preview factory and initial prop values
   * `facets` — 3–6 named usage scenarios, each with a `description`
   * `controls` — interactive prop editor entries
   * `note` — copy-paste `registerCard(...)` snippets for `app.pihanga.ts`
   * `registerEvents` — if the card emits actions, log every one via `logEvent`
   * See the "Examples" section above for full schema and skeleton
7. **Optional**
   * `*.test.tsx` (mock `<Card />` if needed)
   * `*.css` imported by the component

---

## Related entry points

* `src/playground/playground.pihanga.ts` – concrete example of wiring cards into the app.
* `src/app.pihanga.ts` - concrete example on top-level frame/page setup
