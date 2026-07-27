# Sheet Card (`pi/sheet`)

A slide-in panel anchored to any edge of the viewport, backed by
[shadcn/ui Sheet](https://ui.shadcn.com/docs/components/sheet) (Radix Dialog).

## When to use

| Use Sheet when… | Use Drawer when… |
|---|---|
| You need a modal overlay with backdrop | You want a touch-draggable bottom sheet (Vaul) |
| The panel slides from left/right/top/bottom | You primarily target mobile / touch interactions |
| You want standard dialog accessibility (focus trap, ESC) | You want the "pull to dismiss" gesture |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `PiCardRef` | — | Card to render as the open trigger |
| `content` | `PiCardRef` | **required** | Card rendered inside the sheet body |
| `title` | `string` | — | Header title |
| `description` | `string` | — | Header subtitle |
| `open` | `boolean` | — | Controlled open state |
| `side` | `"right" \| "left" \| "top" \| "bottom"` | `"right"` | Edge the sheet slides in from |
| `footer` | `PiCardRef` | — | Custom footer card (overrides default close button) |
| `footerCloseButtonText` | `string \| null` | `"Close"` | Close button text; `null` hides it |
| `className` | `string` | — | CSS classes for the sheet content panel |
| `headerClassName` | `string` | — | CSS classes for the header |
| `contentClassName` | `string` | — | CSS classes for the body wrapper |
| `footerClassName` | `string` | — | CSS classes for the footer |

## Events

| Event | Payload | When |
|---|---|---|
| `onOpened` | `{ id? }` | Sheet becomes visible |
| `onClosed` | `{ id?, reason: "user" \| "programmatic" }` | Sheet is dismissed |
| `onOpenChanged` | `{ open, id? }` | Any open/close transition |

## Rendering model

```
┌─ Page / Navbar / any container ─────────────┐
│  <Sheet card>                               │
│    → [trigger button] ← rendered HERE       │
│       (inline, at the card's mount point)   │
└─────────────────────────────────────────────┘
         ↓ user clicks
┌─ document.body (portal) ───────────────────────────────┐
│  [overlay backdrop]                                    │
│  [Sheet panel slides in from side]                     │
│    title / description                                 │
│    <content card>                                      │
│    [Close button]                                      │
└────────────────────────────────────────────────────────┘
```

The `trigger` card renders **where the Sheet card is mounted** (e.g. in a
navbar, a toolbar, a sidebar).  The sheet panel itself is always portaled
to `document.body` via Radix `<SheetPortal>`, so it floats above all other
content regardless of where the Sheet card lives in the React tree.

When no `trigger` is provided, nothing renders at the mount point — open
the sheet programmatically by setting `open: true` via a state selector.

## Usage

```ts
import {registerCard, register} from "@pihanga2/core";
import {Sheet, onSheetClosed} from "@pihanga2/shadcn";
import {Button} from "@pihanga2/shadcn";

register((r) => {
  onSheetClosed(r, (state, {id, reason}) => {
    if (id === "settings") state.settingsOpen = false;
  });
});

registerCard("myApp/settingsSheet", Sheet({
  id:          "settings",
  trigger:     Button({label: "Settings", opts: {variant: "outline"}}),
  content:     "myApp/settingsContent",
  title:       "Settings",
  description: "Adjust your preferences.",
  side:        "right",
}));
```

### Programmatic control

```ts
registerCard("myApp/sheet", Sheet({
  open:    memo((s: AppState) => s.sheetOpen),
  content: "myApp/sheetContent",
  title:   "Details",
}));
```
