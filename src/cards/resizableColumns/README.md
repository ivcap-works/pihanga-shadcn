# ResizableColumns Card (`pi/resizable-columns`)

A horizontal flex layout where the user can drag dividers to resize columns at runtime.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columnCards` | `PiCardRef[]` | — | One card per column, left → right |
| `columnWidths` | `string[]` | equal split | Initial widths: `'200px'`, `'30%'`, `'1fr'`, `'auto'` |
| `minColumnPercent` | `number` | `10` | Minimum % any column can shrink to |
| `className` | `string` | — | Additional CSS classes on the container |
| `dividerClassName` | `string` | — | Additional CSS classes on each drag handle |

## Column width syntax

`columnWidths` uses CSS-like values parsed once at mount:

| Value | Meaning |
|-------|---------|
| `'200px'` | Fixed initial width (resolved against container width) |
| `'30%'` | Explicit percentage of container |
| `'1fr'` | Fraction of remaining space after `px`/`%` columns |
| `'auto'` | Natural content width — **no drag handle** rendered for adjacent boundaries |

Values are normalised so the explicit tracks sum to 100 %. After that the user drags freely.

## Usage

```ts
import {registerCard} from "@pihanga2/core";
import {ResizableColumns} from "@/cards/resizableColumns";

registerCard("myApp/shell", ResizableColumns({
  columnCards: ["myApp/sidebar", "myApp/content"],
  columnWidths: ["240px", "1fr"],
}));
```

## Keyboard accessibility

Each drag handle supports keyboard control:

| Key | Action |
|-----|--------|
| `←` / `→` | Nudge 2 % |
| `Shift+←` / `Shift+→` | Nudge 10 % |
| `Home` / `End` | Snap to min / max |
