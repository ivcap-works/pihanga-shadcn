import {createCardDeclaration} from "@pihanga2/core";
import type {ChartConfig} from "@/components/ui/chart";

export const PI_CHART_GRAPH_CARD = "shad/chart-graph";

export const Chart =
  createCardDeclaration<PiChartGraphProps>(PI_CHART_GRAPH_CARD);

// Re-export for consumer convenience when building a ChartConfig
export type {ChartConfig};

// ---------------------------------------------------------------------------
// Data structures
// ---------------------------------------------------------------------------

export type PiChartSeries = {
  /** Key in each data-point object whose value will be plotted on the y-axis. */
  dataKey: string;
  /** Human-readable label used in the tooltip and legend. Defaults to `dataKey`. */
  label?: string;
  /**
   * CSS colour string for this series.
   * Falls back to the shadcn chart CSS variables
   * (`hsl(var(--chart-1))`, `hsl(var(--chart-2))`, …) in order.
   */
  color?: string;

  // ── Line styling ──────────────────────────────────────────────────────────

  /**
   * Recharts curve interpolation type.
   * Common values: `"natural"` (smooth, default), `"linear"`, `"step"`,
   * `"stepBefore"`, `"stepAfter"`, `"monotone"`.
   */
  curveType?:
    | "natural"
    | "linear"
    | "monotone"
    | "step"
    | "stepBefore"
    | "stepAfter";

  /** Stroke width in pixels.  Defaults to `2`. */
  strokeWidth?: number;

  /**
   * SVG `stroke-dasharray` value for a dashed/dotted line.
   * e.g. `"4 4"` → short dashes, `"8 4"` → long dashes, `undefined` → solid.
   */
  strokeDasharray?: string;

  /**
   * Show a dot at each data point.
   * `false` (default) hides dots; `true` shows them with the recharts defaults;
   * pass an object (e.g. `{ r: 4, fill: "white" }`) for full SVG circle control.
   */
  dot?: boolean | Record<string, unknown>;

  // ── Area fill styling ─────────────────────────────────────────────────────

  /**
   * CSS colour override for the filled area (`chartType: "area"` only).
   * Defaults to the same value as `color` so the fill matches the stroke.
   *
   * @example `fillColor: "hsl(var(--chart-3))"` — fill with a different palette colour.
   * @example `fillColor: "transparent"` — stroke-only appearance inside an AreaChart.
   */
  fillColor?: string;

  /**
   * Per-series fill opacity (`chartType: "area"` only).
   * Overrides the chart-level `fillOpacity` prop for this series.
   * Range 0–1.
   */
  fillOpacity?: number;
};

/**
 * A single recharts `<ReferenceArea>` to overlay on the chart.
 * Highlights a rectangular region between two x or y coordinates.
 *
 * @example
 * ```ts
 * // Highlight a y-range (horizontal band)
 * { y1: 100, y2: 200, fill: "var(--chart-3)", fillOpacity: 0.2, label: "Target zone" }
 *
 * // Highlight an x-range (vertical band)
 * { x1: "Feb", x2: "Apr", fill: "var(--chart-2)", fillOpacity: 0.15 }
 * ```
 */
export type PiChartReferenceArea = {
  /** Start value on the **x-axis**.  Omit for a y-only band. */
  x1?: string | number;
  /** End value on the **x-axis**.  Omit for a y-only band. */
  x2?: string | number;
  /** Start value on the **y-axis**.  Omit for an x-only band. */
  y1?: number;
  /** End value on the **y-axis**.  Omit for an x-only band. */
  y2?: number;

  /**
   * Label rendered inside the area.  Pass a plain string or a
   * `{ value, position, fill, fontSize }` object for full control.
   */
  label?:
    | string
    | {value: string; position?: string; fill?: string; fontSize?: number};

  /** CSS fill colour.  Defaults to `"var(--chart-1)"`. */
  fill?: string;

  /** Fill opacity, 0–1.  Defaults to `0.2`. */
  fillOpacity?: number;

  /** CSS colour for the area border stroke. */
  stroke?: string;

  /** SVG `stroke-dasharray` for the area border. */
  strokeDasharray?: string;

  /** Area border width in pixels. */
  strokeWidth?: number;

  /**
   * Behaviour when the area extends beyond the chart boundary.
   * `"discard"` | `"hidden"` | `"visible"` | `"extendDomain"`.
   * Defaults to `"discard"`.
   */
  ifOverflow?: "discard" | "hidden" | "visible" | "extendDomain";
};

/**
 * A single recharts `<ReferenceLine>` to overlay on the chart.
 * Specify either `x` (vertical line) or `y` (horizontal line).
 *
 * @example
 * ```ts
 * // Horizontal threshold at y = 100
 * { y: 100, label: "Limit", stroke: "red", strokeDasharray: "4 4" }
 *
 * // Vertical marker at a specific x value
 * { x: "Mar", label: "Launch", stroke: "var(--chart-2)" }
 * ```
 */
export type PiChartReferenceLine = {
  /**
   * Value on the **x-axis** where a vertical reference line is drawn.
   * Omit when drawing a horizontal line.
   */
  x?: string | number;

  /**
   * Value on the **y-axis** where a horizontal reference line is drawn.
   * Omit when drawing a vertical line.
   */
  y?: number;

  /**
   * Label rendered beside the line.  Pass a plain string for the recharts
   * default positioning, or a `{ value, position, fill, fontSize }` object
   * for full control (recharts `LabelProps`).
   */
  label?:
    | string
    | {value: string; position?: string; fill?: string; fontSize?: number};

  /** CSS colour for the line stroke.  Defaults to `"var(--border)"`. */
  stroke?: string;

  /**
   * SVG `stroke-dasharray` value for the line style.
   * `"4 4"` → short dashes, `"8 4"` → long dashes, `undefined` → solid.
   */
  strokeDasharray?: string;

  /** Line stroke width in pixels.  Defaults to `1`. */
  strokeWidth?: number;
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type PiChartGraphProps = {
  /**
   * Whether to render an **area** chart (filled) or a **line** chart (stroke only).
   */
  chartType: "area" | "line";

  /**
   * Array of data points.  Each entry must contain:
   * - a value for `xDataKey` (used for the x-axis labels), and
   * - a numeric value for each `series[].dataKey`.
   *
   * @example
   * ```ts
   * [
   *   { month: "Jan", desktop: 186, mobile: 80 },
   *   { month: "Feb", desktop: 305, mobile: 200 },
   * ]
   * ```
   */
  data: Array<Record<string, unknown>>;

  /**
   * Series definitions.  Each entry describes one plotted line or area.
   * At least one series is required.
   */
  series: PiChartSeries[];

  /** Key inside each data-point object used for the x-axis tick labels. */
  xDataKey: string;

  /**
   * Optional card title rendered above the chart.
   * When either `title` or `description` is set the chart is wrapped in a
   * shadcn `<Card>` shell; otherwise it renders as a bare `<div>`.
   */
  title?: string;

  /**
   * Optional subtitle rendered below `title`.
   * Has no effect when `title` is not set.
   */
  description?: string;

  /**
   * Minimum chart height in pixels.
   * The chart expands if the responsive container requires more space.
   * Defaults to `250`.
   */
  height?: number;

  /** Show a legend beneath the chart.  Defaults to `true`. */
  showLegend?: boolean;

  /** Show horizontal cartesian grid lines.  Defaults to `true`. */
  showGrid?: boolean;

  /**
   * Show the x-axis tick labels along the bottom of the chart.
   * Defaults to `true`.  Set to `false` to hide the x-axis entirely.
   */
  showXAxisLabel?: boolean;

  /**
   * Show the y-axis with numeric tick labels on the left edge of the chart.
   * Defaults to `false` (y-axis hidden) to keep the chart compact.
   * Alias: `showYAxisLabel`.
   */
  showYAxis?: boolean;

  /**
   * Alias for `showYAxis` — provided for naming consistency with `showXAxisLabel`.
   * When either flag is `true` the y-axis is rendered.
   */
  showYAxisLabel?: boolean;

  /**
   * Minimum value for the y-axis domain.  Defaults to `"auto"` (data-driven).
   * Pass `0` to always start the y-axis at zero.
   */
  yAxisMin?: number;

  /**
   * Maximum value for the y-axis domain.  Defaults to `"auto"` (data-driven).
   */
  yAxisMax?: number;

  /**
   * Minimum value for the x-axis domain.  Only meaningful for numeric x-axes.
   * Defaults to `"auto"` (data-driven).
   */
  xAxisMin?: number;

  /**
   * Maximum value for the x-axis domain.  Only meaningful for numeric x-axes.
   * Defaults to `"auto"` (data-driven).
   */
  xAxisMax?: number;

  /**
   * Unit string appended to every y-axis tick label (e.g. `"ms"`, `"%"`, `" km"`).
   * Only visible when `showYAxis` is `true`.
   *
   * @example `yAxisUnit="%"` renders ticks as `"0%"`, `"50%"`, `"100%"`.
   */
  yAxisUnit?: string;

  /**
   * Unit string appended to every x-axis tick label.
   * Useful when x-axis values are numeric (e.g. seconds, iterations).
   * Has no effect when x-axis values are already formatted strings (e.g. month names).
   *
   * @example `xAxisUnit="s"` renders ticks as `"1s"`, `"2s"`, etc.
   */
  xAxisUnit?: string;

  /**
   * Stack all area series on top of each other (area chart only).
   * When `false` (default) the filled areas overlap.
   */
  stacked?: boolean;

  /**
   * Opacity of the filled area (area chart only).
   * Range 0–1.  Defaults to `0.4`.
   */
  fillOpacity?: number;

  /**
   * Suppress the recharts entry animation so the chart renders immediately
   * without the "draw-in" / "unfold" effect.
   * Defaults to `false` (animation enabled).
   */
  suppressAnimation?: boolean;

  /**
   * One or more reference lines to overlay on the chart.
   * Each entry maps directly to a recharts `<ReferenceLine>`.
   *
   * @example
   * ```ts
   * referenceLines: [
   *   { y: 100, label: "Threshold", stroke: "red",   strokeDasharray: "4 4" },
   *   { x: "Mar", label: "Launch",  stroke: "var(--chart-2)" },
   * ]
   * ```
   */
  referenceLines?: PiChartReferenceLine[];

  /**
   * One or more reference areas to overlay on the chart.
   * Each entry maps directly to a recharts `<ReferenceArea>` and highlights
   * a rectangular region (x-band, y-band, or both).
   *
   * @example
   * ```ts
   * referenceAreas: [
   *   { y1: 100, y2: 200, fill: "var(--chart-3)", fillOpacity: 0.15, label: "Target" },
   *   { x1: "Feb", x2: "Apr", fill: "var(--chart-4)", fillOpacity: 0.1 },
   * ]
   * ```
   */
  referenceAreas?: PiChartReferenceArea[];

  /** Extra Tailwind / CSS classes forwarded to the outermost element. */
  className?: string;
};
