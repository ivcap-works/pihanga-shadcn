A **meta card** reimplementation of `pageWithNavbar` — assembled entirely from
existing pihanga-shadcn cards, no JSX or DOM knowledge required.

**Layout:**

```
┌────────────────────────────────────────────────────────┐
│  Header: [Title + icon]  [Nav links…]  [Action slots]  │
├────────────────────────────────────────────────────────┤
│  Main (overflow-y-auto, flex-1)                        │
├────────────────────────────────────────────────────────┤
│  Footer (optional, shrink-0)                           │
└────────────────────────────────────────────────────────┘
```

On small screens the nav links collapse into a **left-side hamburger drawer**
(`pi/drawer`) so the header stays compact on mobile.

**Differences from the primitive `pageWithNavbar`:**

| Feature | `pageWithNavbar` | `pageWithNavbarMeta` |
|---|---|---|
| `style` override prop | ✅ | ❌ removed (use `className`) |
| `SizeMap` for header slots | ✅ | ❌ plain `PiCardRef` only |
| `scrollResetKey` | ✅ | ❌ reserved, not yet implemented |
| Mobile nav | shadcn Sheet | `pi/drawer` (left, with drag-to-close) |
| Reactive `main` prop | ✅ | ✅ via prop-function resolve |
