Renders a child card only when a boolean predicate and/or a viewport-width (or
container-width) breakpoint condition is satisfied, and an optional fallback
card when the condition is not met.

Use `shad/conditional` to show or hide any card based on application state
**or window/container width** without reaching for CSS `hidden` / `display:none`
hacks.  The content card is **mounted and unmounted** from the React tree — not
just visually hidden — so subscriptions, side-effects, and focus state inside it
are fully reset when the condition changes.

| Prop | Purpose |
|---|---|
| `content` | The card to render when the visibility condition is met |
| `alternativeContent` | Optional card to render when **all** visibility conditions are `false`; nothing is rendered when omitted |
| `show` | Optional boolean gate (default `true`); drive with `memo()` for reactive mount/unmount |
| `showOn` | Optional breakpoint selector; mounts content only when the width condition is met |
| `containerQuery` | When `true`, `showOn` is evaluated against the **enclosing container** width (via `ResizeObserver`) instead of the viewport (via `matchMedia`) |
| `keepMounted` | When `true`, both `content` and `alternativeContent` stay mounted at all times; visibility is toggled via `display:none` / `display:contents` |

When **both** `show` and `showOn` are provided the card is visible only when
both conditions are satisfied (logical AND).  When neither condition is met,
`alternativeContent` is rendered instead (if provided).

### `showOn` selector formats

| Value | Meaning |
|---|---|
| `sm` | width ≥ 640 px (Tailwind `sm`) |
| `md` | width ≥ 768 px |
| `lg` | width ≥ 1024 px |
| `xl` | width ≥ 1280 px |
| `2xl` | width ≥ 1536 px |
| `400px` | width ≥ 400 px (bare value = min-width) |
| `>=640px` | width ≥ 640 px |
| `>640px` | width > 640 px |
| `<=1024px` | width ≤ 1024 px |
| `<768px` | width < 768 px |

Common use-cases: auth-gating a dashboard, showing an empty-state hint when a
list has no items, swapping an edit form in/out of a read-only view, showing a
desktop sidebar only on large screens, showing a mobile drawer only on small
screens, adapting a panel's content to its own rendered width, or swapping
between two cards at a responsive breakpoint (e.g. desktop layout vs. mobile
layout) using `alternativeContent`.
