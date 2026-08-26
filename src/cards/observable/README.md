A transparent `<div>` wrapper around a single `content` card that reports
low-level DOM interaction events — clicks, mouse enter/move/leave, mouse
down/up, double-click, context menu, wheel, key down/up, and focus/blur.

Every event type is **opt-in** via the `enable` prop. An event that is not
enabled is neither listened for (no DOM listener is attached) nor reported
(its `onXxx` callback never fires) — so there's no overhead for events you
don't need.

All mouse/wheel events report pointer position two ways:

- `absoluteX` / `absoluteY` — relative to the top-left of the **page**
  (i.e. includes page scroll offset).
- `relativeX` / `relativeY` — relative to the top-left of the
  `Observable` card's own bounding box.

Use `Observable` to add interaction telemetry or custom gesture handling to
any existing card/content without modifying that card itself — just wrap it.

Keyboard events (`keyDown`/`keyUp`) and focus tracking require the wrapper
`<div>` to be focusable; when any of `keyDown`, `keyUp`, `focus`, or `blur`
is enabled, the component automatically sets `tabIndex={0}` on the root.
