# AGENT.md — pihanga-shadcn (entry point)

AI coding assistants (Cline, Cursor, Windsurf, Claude, etc.) should read this
file **first** at the start of every task in a project that involves
`pihanga-shadcn`, then follow the pointer below that matches the task.

---

## What is pihanga-shadcn?

`pihanga-shadcn` is a library of **Pihanga card components** built on top of
[shadcn/ui](https://ui.shadcn.com) and [Radix UI](https://radix-ui.com).  Cards
are distributed as a **shadcn-style copy-on-install registry** — consumers run
`npx shadcn@latest add <url>` and the CLI copies TypeScript source files
directly into the project.

Registry base URL:
```
https://ivcap-works.github.io/pihanga-shadcn/r
```

Source repository:
```
https://github.com/ivcap-works/pihanga-shadcn
```

---

## Which guide do you need?

| If your task is … | Read this file |
|---|---|
| **Getting started** — brand-new project, shadcn/ui + pihanga setup, file layout | [`AGENTS.getting-started.md`](./AGENTS.getting-started.md) |
| **Using** existing cards — install, wire, compose, navigate | [`AGENT.using-cards.md`](./AGENT.using-cards.md) |
| **Building complex UI** — assembling a reusable widget from existing cards | [`AGENT.building-cards.md`](./AGENT.building-cards.md) — § *Meta cards* |
| **Building** a new primitive card from scratch — new React component for this repo | [`AGENT.building-cards.md`](./AGENT.building-cards.md) |

If you are **starting from scratch**, read `AGENTS.getting-started.md` first — it
covers Vite setup, shadcn/ui init, pihanga-core installation, and the initial file
layout.  Then continue with `AGENT.using-cards.md` for wiring and composing cards.

If you are adding cards to an **existing project**, go straight to
`AGENT.using-cards.md`.

### ⭐ Need a complex, reusable UI widget?  Use a meta card.

Before writing a new React component, ask: *can I build this by composing
existing cards?*  If yes — and that is almost always the answer — use a
**meta card** instead.

A meta card is a TypeScript-only module (no JSX, no React imports) that
assembles other cards inside a mapper function and registers itself with
`registerMetaCard`.  The result looks and feels exactly like a primitive card to
consumers: a typed factory function, typed event helpers, and full `memo()`/state
reactivity.

```ts
// example/src/counter.card.ts (abbreviated)
import {registerMetaCard, createCardDeclaration, registerActions} from "@pihanga2/core";
import {Stack, Button, Typography} from "@pihanga2/shadcn";

const COUNTER_CARD = "meta/counter";
export const Counter = createCardDeclaration<CounterProps, CounterEvents>(COUNTER_CARD);
export const COUNTER_ACTION = registerActions(COUNTER_CARD, ["changed"]);

registerMetaCard({
  type: COUNTER_CARD,
  mapper(_name, props, registerCard) {
    return Stack({ content: [
      Button({ label: "−", onClickedMapper: (_, {resolve}) => ({type: COUNTER_ACTION.CHANGED, value: resolve(props.value) - 1}) }),
      Typography({ text: (_, {resolve}) => `Count: ${resolve(props.value)}` }),
      Button({ label: "+", onClickedMapper: (_, {resolve}) => ({type: COUNTER_ACTION.CHANGED, value: resolve(props.value) + 1}) }),
    ]});
  },
  events: COUNTER_ACTION,
});
```

**Why meta cards over new React components?**

| Concern | Meta card | New React component |
|---|---|---|
| Code complexity | Low — pure TypeScript config | High — JSX, hooks, event wiring |
| Maintenance | Inherits upstream fixes automatically | Must be kept in sync manually |
| Reusability | Drops into any Pihanga app | Tightly coupled to one project |
| Testability | Plain function, mockable | Requires DOM + Redux setup |
| Extendibility | Swap out any inner card without touching consumers | Requires internal refactoring |

See the full meta card guide in [`AGENT.building-cards.md`](./AGENT.building-cards.md#meta-cards--composing-new-widgets-from-existing-cards)
and the complete working example at [`example/src/counter.card.ts`](./example/src/counter.card.ts).

Switch to `AGENT.building-cards.md` — § *Building a primitive card from scratch* — only
when no combination of existing cards can achieve the required UI.

---

## Universal rules (apply to both guides)

- **`src/components/` is read-only** — it is managed by the shadcn CLI.  Never
  add custom code there.  All custom code lives in `src/cards/<cardName>/`.
- **`@pihanga2/core`** is always available; do not list it in `dependencies.json`.
- **One `registerFramework()` per app boot** — composing multiple init functions
  must ensure only one of them calls it.
- **`children` is a reserved React prop** — never use it in a card's `…Props`
  type; use `content`, `contentCard`, or `items` instead.
- **npm channel: add `lucide-react` to `optimizeDeps.include`** — excluding
  `@pihanga2/shadcn` from Vite's pre-bundler (required to prevent duplicate
  registries) also causes `lucide-react` to be served as raw ESM, triggering
  ~1 000 individual icon file requests in the dev browser.  Adblockers block
  `fingerprint.js` as a tracking script.  Always include `"lucide-react"` in
  `optimizeDeps.include` (see `AGENTS.getting-started.md` Step 5).  Production
  builds are unaffected — Rollup tree-shakes unused icons normally.
