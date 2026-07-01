A chart card wrapping [shadcn/ui Charts](https://ui.shadcn.com/charts) (built on [Recharts](https://recharts.org)).
Supports **area** and **line** chart types with optional multi-series, stacking, legend, and grid lines.

### Key props

| Prop | Default | Purpose |
|------|---------|---------|
| `chartType` | — | `"area"` or `"line"` |
| `data` | — | Array of data-point objects |
| `series` | — | Maps data keys → label + colour |
| `xDataKey` | — | Key used for x-axis tick labels |
| `title` / `description` | — | When provided the chart is wrapped in a shadcn `<Card>` |
| `stacked` | `false` | Stack area series (area only) |
| `fillOpacity` | `0.4` | Fill transparency for area series |
| `showLegend` / `showGrid` | `true` | Toggle legend and grid lines |

Colours fall back to the shadcn chart CSS variables (`--chart-1` … `--chart-5`)
when not explicitly set on a series.
