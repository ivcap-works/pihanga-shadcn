A multi-line text input rendered as a shadcn `<Textarea>`, with an explicit
sizing model built on the CSS `field-sizing` property.

Use it inside a `pi/form` card (with `name`) to bind it to form state, or
standalone (with `value`) for directly controlled string values.

## Sizing modes (`fieldSizing`)

- **`"fixed"`** (default) — classic `<textarea>` behaviour. Size is governed
  by `rows`/`cols`; the user may drag-resize it per the `resize` prop
  (default `"vertical"`). Never grows with content.
- **`"content"`** — the box grows/shrinks to fit its content using the
  browser's native `field-sizing: content`. Clamp it with `minHeight`,
  `maxHeight`, `width`/`height`, and `maxWidth`. `rows`/`cols` are silently
  ignored by the browser once this is active — don't rely on them together.

Because native `field-sizing: content` is used, all of the tricky
content-driven cases (multi-line placeholders, programmatic value sets, form
resets, becoming visible from `display:none`, long unbroken strings,
font-size/zoom changes) size correctly automatically — there is no
JS `scrollHeight`-mirroring code that can get out of sync.

## Constraint cookbook

| Scenario | Props |
|---|---|
| Vertical auto-grow, fixed width | `fieldSizing="content" width="100%" resize="none"` |
| Unconstrained growth (both axes) | `fieldSizing="content"` only — cautionary; starts as an ~11px stub |
| Bounded growth | `fieldSizing="content" minHeight="2lh" maxHeight="8lh"` |
| Fixed-height scroll pane | `height={200}` (no `fieldSizing`) |
| Explicit width + content | `fieldSizing="content" width={600}` → inline frozen, block still grows |
| Explicit height + content (anti-pattern) | `fieldSizing="content" width={58} height={100}` → frozen + clipped |
| Overflow guard | always set `maxWidth` alongside unconstrained `fieldSizing="content"` |
| Escape hatch (grow but still resizable) | `fieldSizing="content" resize="vertical"` |

When `fieldSizing="content"`, `resize` defaults to `"none"` — dragging would
write an inline `width`/`height` that permanently defeats content sizing.
Set `resize="vertical"` explicitly if you want that escape hatch.

## Vertical writing mode

Set `writingMode="vertical-rl"` for vertical text. Sizing axes are
writing-mode-relative: under `fieldSizing="content"`, growth then runs along
the inline axis (horizontally for `vertical-rl`), not top-to-bottom.

## Submit on Enter

Set `submitOnEnter` to fire `onSubmitted({name, value})` when the user
presses Enter (without Shift/Ctrl/Meta/Alt). Shift+Enter (etc.) still inserts
a newline as usual. Useful for chat-style inputs.

## Self-managed mode (throttling change events) — standalone only

By default every keystroke dispatches `onChanged` — fine for most cases, but
wasteful if the handler is expensive (e.g. triggers an API call, autosave, or
a heavy re-render).

Set `selfManaged` (standalone mode, i.e. no `name`/no `pi/form` ancestor) to
have the component track its own internal text buffer. The visible text
still updates on every keystroke with zero lag, but the outgoing `onChanged`
event is only **committed**:

- on blur — always, and
- after `debounceMs` of typing inactivity, if you set `debounceMs > 0`
  (so a long-lived edit without a blur — e.g. an autosave-while-typing flow —
  still gets a periodic commit).

Pressing Enter with `submitOnEnter` also commits immediately (cancelling any
pending debounce) before firing `onSubmitted`.

```ts
TextArea({
  selfManaged: true,
  debounceMs: 500, // commit at most twice a second while typing
  onChanged: ...,
});
```

**Inside a `pi/form`** (i.e. `name` set and a `pi/form` ancestor present),
`selfManaged`/`debounceMs` have **no effect** — exactly like `pi/input` and
`pi/text-field`, every keystroke writes straight to form state via
`form.handleChange`. The form's own submit action is the natural "commit"
point in that case, so there is no separate throttling to do at the field
level.

## RTL / disabled / read-only

Set `dir="rtl"` for right-to-left text. `disabled` and `readOnly` behave like
the native attributes and are preserved at any grown size.

## Auto-focus on first show

Set `autoFocus` to have the textarea grab keyboard focus the first time it is
mounted — e.g. when a dialog or drawer containing it opens. It only fires
once, on mount; it will not re-focus on subsequent re-renders.

```ts
TextArea({name: "message", autoFocus: true});
```
