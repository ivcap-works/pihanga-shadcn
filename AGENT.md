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
| **Using** existing cards — install, wire, compose, navigate | [`AGENT.using-cards.md`](./AGENT.using-cards.md) |
| **Building** new cards — create a new card type for this repo | [`AGENT.building-cards.md`](./AGENT.building-cards.md) |

If you are **unsure**, start with `AGENT.using-cards.md`; it covers the common
app-building case.  Switch to `AGENT.building-cards.md` only when you need to
add a new card *type* to `src/cards/` itself.

---

## Universal rules (apply to both guides)

- **`src/components/` is read-only** — it is managed by the shadcn CLI.  Never
  add custom code there.  All custom code lives in `src/cards/<cardName>/`.
- **`@pihanga2/core`** is always available; do not list it in `dependencies.json`.
- **One `registerFramework()` per app boot** — composing multiple init functions
  must ensure only one of them calls it.
- **`children` is a reserved React prop** — never use it in a card's `…Props`
  type; use `content`, `contentCard`, or `items` instead.
