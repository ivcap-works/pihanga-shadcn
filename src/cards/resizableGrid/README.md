# ResizableGrid Card (`pi/resizable-grid`)

A 2-D CSS Grid layout where users can drag both column and row dividers at runtime.
All cells in the same row share the same height (enforced by the browser's CSS Grid engine).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cells` | `PiCardRef[][]` | — | 2-D array `[row][col]` — must be rectangular |
| `columnWidths` | `string[]` | equal `1fr` split | Initial column widths |
| `rowHeights` | `string[]` | equal `1fr` split | Initial row heights |
| `minColumnPercent` | `number` | `10` | Min % any explicit column can shrink to |
| `minRowPercent` | `number` | `10` | Min % any explicit row can shrink to |
| `className` | `string` | — | Additional CSS classes on the container |
| `dividerClassName` | `string` | — | Additional CSS classes on dividers |

## Width / height syntax

Both `columnWidths` and `rowHeights` accept the same CSS-like values:

| Value | Meaning |
|-------|---------|
| `'200px'` | Fixed initial size (resolved against container at mount) |
| `'30%'` | Explicit percentage |
| `'1fr'` | Fraction of remaining space after `px`/`%` tracks |
| `'auto'` | Natural content size — **no drag handle** rendered for adjacent boundaries |

A drag handle only appears between two adjacent tracks where **both** are explicit (non-`auto`).

## Usage

```ts
import {registerCard} from "@pihanga2/core";
import {ResizableGrid} from "@/cards/resizableGrid";

registerCard("myApp/workspace", ResizableGrid({
  cells: [
    ["myApp/sidebar", "myApp/editor"],
    ["myApp/console", "myApp/console"],
  ],
  columnWidths: ["220px", "1fr"],
  rowHeights:   ["1fr", "200px"],
}));
```

## Keyboard accessibility

Column dividers respond to `←` / `→`; row dividers respond to `↑` / `↓`.
`Home` / `End` snap to minimum / maximum. `Shift` multiplies the nudge step by 5×.
