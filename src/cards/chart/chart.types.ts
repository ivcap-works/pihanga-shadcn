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

  /** Extra Tailwind / CSS classes forwarded to the outermost element. */
  className?: string;
};
