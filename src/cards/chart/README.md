A chart card wrapping [shadcn/ui Charts](https://ui.shadcn.com/charts) (built on [Recharts](https://recharts.org)).
Supports **area** and **line** chart types with optional multi-series, stacking, legend, and grid lines.

### Key props

| Prop | Default | Purpose |
|------|---------|---------|
| `chartType` | — | `"area"` or `"line"` |
| `data` | — | Array of data-point objects |
| `series` | — | Maps data keys → label + colour (see per-series styling below) |
| `xDataKey` | — | Key used for x-axis tick labels |
| `title` / `description` | — | When provided the chart is wrapped in a shadcn `<Card>` |
| `stacked` | `false` | Stack area series (area only) |
| `fillOpacity` | `0.4` | Default fill transparency for all area series |
| `showLegend` / `showGrid` | `true` | Toggle legend and grid lines |

Colours fall back to the shadcn chart CSS variables (`--chart-1` … `--chart-5`)
when not explicitly set on a series.

### Per-series line & area styling

All styling options live on each entry in the `series` array:

| Series prop | Default | Applies to | Purpose |
|-------------|---------|------------|---------|
| `color` | `--chart-N` | both | Stroke colour (and default fill colour for area). Any valid CSS colour works: `"red"`, `"#3b82f6"`, `"oklch(0.6 0.15 220)"`, `"var(--chart-2)"`. |
| `curveType` | `"natural"` | both | Recharts curve interpolation: `"natural"`, `"linear"`, `"monotone"`, `"step"`, `"stepBefore"`, `"stepAfter"` |
| `strokeWidth` | `2` | both | Line thickness in pixels |
| `strokeDasharray` | — | both | SVG dash pattern, e.g. `"4 4"` (short dashes), `"8 4"` (long dashes) |
| `dot` | `false` | both | `true` shows recharts default dots; pass `{ r: 4, fill: "white" }` for custom SVG circle props |
| `fillColor` | same as `color` | area | Override fill colour independently of the stroke. Any valid CSS colour. When omitted, the fill matches `color`. |
| `fillOpacity` | chart `fillOpacity` | area | Per-series fill transparency (0–1); overrides the chart-level prop |

> **Area chart tip:** `color` controls the *stroke* line; `fillColor` controls the filled area beneath it.
> If you only set `color: "red"` the fill will also be `"red"` (at the current `fillOpacity`).
> To get a red stroke with the default palette fill, set `fillColor: "var(--chart-1)"` explicitly.

### Examples

**Styled mixed-series line chart**

```ts
import {Chart} from "@/cards/chart";

registerCard("myApp/styledLines", Chart({
  chartType: "line",
  xDataKey: "month",
  data: [...],
  series: [
    // Solid smooth line with no dots
    {
      dataKey: "desktop", label: "Desktop",
      color: "var(--chart-1)",
      curveType: "natural", strokeWidth: 2, strokeDasharray: undefined, dot: false,
    },
    // Thicker dashed line with visible dots
    {
      dataKey: "mobile", label: "Mobile",
      color: "var(--chart-2)",
      curveType: "natural", strokeWidth: 3, strokeDasharray: "6 3", dot: true,
    },
    // Step-interpolated thin line, no dots
    {
      dataKey: "tablet", label: "Tablet",
      color: "var(--chart-3)",
      curveType: "step", strokeWidth: 1, strokeDasharray: undefined, dot: false,
    },
  ],
}));
```

**Area chart with per-series fill control**

```ts
registerCard("myApp/deviceArea", Chart({
  chartType: "area",
  xDataKey: "month",
  data: [...],
  series: [
    // Filled area — solid smooth line, 60 % opaque fill matching the stroke
    {
      dataKey: "desktop", label: "Desktop",
      color: "var(--chart-1)",
      curveType: "natural", strokeWidth: 2, strokeDasharray: undefined, dot: false,
      fillColor: "var(--chart-1)", fillOpacity: 0.6,
    },
    // Stroke-only — dashed line, transparent fill so the area shows no shading
    {
      dataKey: "mobile", label: "Mobile",
      color: "var(--chart-2)",
      curveType: "natural", strokeWidth: 2, strokeDasharray: "4 4", dot: false,
      fillColor: "transparent", fillOpacity: 0,
    },
  ],
}));
```

**Multi-series stacked area with custom colours**

```ts
registerCard("myApp/deviceChart", Chart({
  chartType: "area",
  xDataKey: "month",
  data: [
    {month: "Jan", desktop: 186, mobile: 80},
    {month: "Feb", desktop: 305, mobile: 200},
    {month: "Mar", desktop: 237, mobile: 120},
  ],
  series: [
    {
      dataKey: "desktop", label: "Desktop",
      color: "var(--chart-1)",
      curveType: "natural", strokeWidth: 2, strokeDasharray: undefined, dot: false,
      fillColor: "var(--chart-1)", fillOpacity: 0.5,
    },
    {
      dataKey: "mobile", label: "Mobile",
      color: "var(--chart-2)",
      curveType: "natural", strokeWidth: 2, strokeDasharray: undefined, dot: false,
      fillColor: "var(--chart-2)", fillOpacity: 0.5,
    },
  ],
  stacked: true,
  title: "Visits by Device",
}));
```
