A collapsible panel card built on the Radix UI `@radix-ui/react-collapsible`
primitive, following the [shadcn/ui Collapsible](https://ui.shadcn.com/docs/components/collapsible) design.

The header row contains a **Typography title** (or a custom card) and a
**toggle button** with an optional icon (defaults to `ChevronsUpDown`).
The body slot accepts any Pihanga card reference.

## Slots

| Prop | Description |
|---|---|
| `title` + `titleLevel` | Built-in text header, styled as a Typography element. |
| `titleCard` | Alternative header — any Pihanga card (overrides `title`). |
| `icon` | Icon name from the Pihanga icon registry for the toggle button. |
| `contentCard` | Any Pihanga card rendered inside the collapsible body. |

## Open state

| Prop | Mode | Description |
|---|---|---|
| `defaultOpen` | Uncontrolled | Initial open/closed state (default `false`). |
| `open` | Controlled | Drives open state from Redux; update via `onOpenChanged`. |

## Styling

| Prop | Target |
|---|---|
| `className` | Root `<div>` |
| `headerClassName` | Trigger row (title + button) |
| `contentClassName` | Collapsible body wrapper |
| `style` | Inline styles on the root element |
