A transparent wrapper card that intercepts a declared set of keyboard shortcuts
and delivers them as pihanga events, while letting **all** other keyboard input,
mouse events, and touch events pass through to child components unmodified.

## How it works

- Renders its `content` child card normally; the wrapper `<div>` has no visible
  appearance (only `position: relative` is applied by default).
- Attaches a `keydown` listener to `document` in **capture** phase so it sees
  every key press before any focused child element, regardless of focus state.
- Tracks `mousemove` passively to know the cursor's current position without
  causing re-renders.
- When a registered shortcut fires, calls `document.elementFromPoint` at the
  last known cursor position and walks up the DOM tree to find the nearest
  ancestor (inclusive) that carries a `data-{dataKey}` attribute (default:
  `data-pihanga`) — i.e. the deepest card boundary under the cursor.
- Fires `onShortcut` with the shortcut id, matched key, active modifiers, the
  resolved attribute value (`dataValue`), and the cursor coordinates.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `PiCardRef` | — | Child card rendered inside the wrapper. |
| `shortcuts` | `ShortcutDef[]` | — | Shortcuts to watch (see below). |
| `captureFocus` | `boolean` | `true` | When `true`, the wrapper `<div>` is made focusable (`tabIndex -1`) and automatically focused whenever the cursor enters it, so keyboard shortcuts are reliably delivered without stealing focus from the rest of the page at startup. Set to `false` to leave focus management entirely to the application. |
| `dataKey` | `string` | `"pihanga"` | DOM attribute key to walk up the tree for. The overlay looks for `data-{dataKey}` on ancestors of the element under the cursor and forwards the value as `dataValue` in the shortcut event. |
| `className` | `string` | — | Tailwind / CSS classes on the wrapper `<div>`, e.g. `"h-full w-full"`. |
| `style` | `React.CSSProperties` | — | Inline styles merged onto the wrapper `<div>`. `position: relative` always wins. |

### ShortcutDef

| Field | Type | Default | Description |
|---|---|---|---|
| `key` | `string` | — | `KeyboardEvent.key` (e.g. `"k"`, `"Escape"`) or `.code` (e.g. `"KeyK"`). |
| `modifiers` | `Modifier[]` | `[]` | Modifier keys that **must** be active (`"ctrl"`, `"shift"`, `"alt"`, `"meta"`). Matching is strict — any unlisted modifier must be inactive. |
| `id` | `string` | `key` | Optional label forwarded in the event payload so you can identify shortcuts without pattern-matching on key+modifiers. |
| `propagate` | `boolean` | `false` | When `false` (default) the event is consumed (`preventDefault` + `stopPropagation`). Set to `true` to fire the pihanga event **and** still let the keystroke reach the browser / focused child element. |

## Shortcut matching

Modifier matching is **strict**: `{modifiers: ["ctrl"]}` matches `Ctrl+K` but
not `Ctrl+Shift+K`. An empty (or omitted) `modifiers` array matches only bare
key presses with no modifiers held.

`key` is compared against both `KeyboardEvent.key` and `KeyboardEvent.code`, so
either form works.

## Usage

```ts
import {registerCard, register} from "@pihanga2/core";
import {
  KeyboardOverlay,
  onKeyboardShortcut,
} from "@pihanga2/shadcn/cards/keyboardOverlay";

register((r) => {
  onKeyboardShortcut(r, (state, ev) => {
    console.log(
      `Shortcut "${ev.shortcutId}" over card "${ev.dataValue}"`,
      `at (${ev.cursorX}, ${ev.cursorY})`,
    );
  });
});

registerCard("myApp/root", KeyboardOverlay({
  content: "myApp/mainContent",

  // Fill the parent container
  className: "h-full w-full",

  shortcuts: [
    // Ctrl+K — command palette (consumed, not forwarded)
    {key: "k", modifiers: ["ctrl"], id: "command-palette"},
    // Escape — dismiss (consumed)
    {key: "Escape", id: "dismiss"},
    // ? — context help (bare key, no modifiers)
    {key: "?", id: "help"},
    // F12 — dev tools shortcut observed but NOT consumed (propagate: true)
    {key: "F12", id: "devtools", propagate: true},
  ],
}));
```

### Event payload (`KeyboardOverlayShortcutEvent`)

| Field | Type | Description |
|---|---|---|
| `shortcutId` | `string` | `ShortcutDef.id` if set, otherwise the matched `key`. |
| `key` | `string` | The matched key string. |
| `modifiers` | `Modifier[]` | Active modifiers at the time of the event. |
| `dataValue` | `string \| undefined` | Value of the `data-{dataKey}` attribute (default `data-pihanga`) of the deepest matching ancestor under the cursor, or `undefined` if none. |
| `cursorX` | `number` | Cursor X position (CSS pixels, relative to viewport). |
| `cursorY` | `number` | Cursor Y position (CSS pixels, relative to viewport). |
