import React from "react";
import {type PiCardProps} from "@pihanga2/core";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {PiChartGraphProps} from "./chart.types";

/** Cycle through the five shadcn chart palette CSS variables. */
const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export const ChartGraphComponent = (
  props: PiCardProps<PiChartGraphProps>,
): React.ReactNode => {
  const {
    cardName,
    chartType,
    data,
    series,
    xDataKey,
    title,
    description,
    height = 250,
    showLegend = true,
    showGrid = true,
    stacked = false,
    fillOpacity = 0.4,
    showXAxisLabel = true,
    showYAxis = false,
    showYAxisLabel = false,
    yAxisMin,
    yAxisMax,
    xAxisMin,
    xAxisMax,
    yAxisUnit,
    xAxisUnit,
    suppressAnimation = false,
    referenceLines,
    referenceAreas,
    className,
  } = props;

  /** Render all reference areas — rendered before lines so lines appear on top. */
  const referenceAreaEls = referenceAreas?.map((ra, i) => (
    <ReferenceArea
      key={i}
      x1={ra.x1}
      x2={ra.x2}
      y1={ra.y1}
      y2={ra.y2}
      label={ra.label as string | undefined}
      fill={ra.fill ?? "var(--chart-1)"}
      fillOpacity={ra.fillOpacity ?? 0.2}
      stroke={ra.stroke}
      strokeDasharray={ra.strokeDasharray}
      strokeWidth={ra.strokeWidth}
      ifOverflow={ra.ifOverflow ?? "discard"}
    />
  ));

  /** Render all reference lines — shared by both chart types. */
  const referenceLineEls = referenceLines?.map((rl, i) => (
    <ReferenceLine
      key={i}
      x={rl.x}
      y={rl.y}
      label={rl.label as string | undefined}
      stroke={rl.stroke ?? "var(--border)"}
      strokeDasharray={rl.strokeDasharray}
      strokeWidth={rl.strokeWidth ?? 1}
    />
  ));

  // Build the ChartConfig object that powers the tooltip / legend labels and
  // injects per-series CSS custom properties (--color-<dataKey>).
  const chartConfig: ChartConfig = {};
  series.forEach((s, i) => {
    chartConfig[s.dataKey] = {
      label: s.label ?? s.dataKey,
      color: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    };
  });

  // ── Inner chart element ────────────────────────────────────────────────────

  const chartEl =
    chartType === "area" ? (
      <AreaChart data={data} accessibilityLayer>
        {showGrid && <CartesianGrid />}
        <XAxis
          dataKey={xDataKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          unit={xAxisUnit}
          hide={!showXAxisLabel}
          {...(xAxisMin != null || xAxisMax != null
            ? {domain: [xAxisMin ?? "auto", xAxisMax ?? "auto"]}
            : {})}
        />
        <YAxis
          hide={!(showYAxis || showYAxisLabel)}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={yAxisUnit ? 48 : 40}
          unit={yAxisUnit}
          domain={[yAxisMin ?? "auto", yAxisMax ?? "auto"]}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {referenceAreaEls}
        {series.map((s) => (
          <Area
            key={s.dataKey}
            type={s.curveType ?? "natural"}
            dataKey={s.dataKey}
            stroke={`var(--color-${s.dataKey})`}
            strokeWidth={s.strokeWidth ?? 2}
            strokeDasharray={s.strokeDasharray}
            fill={s.fillColor ?? `var(--color-${s.dataKey})`}
            fillOpacity={s.fillOpacity ?? fillOpacity}
            dot={s.dot ?? false}
            isAnimationActive={!suppressAnimation}
            {...(stacked ? {stackId: "stacked"} : {})}
          />
        ))}
        {referenceLineEls}
      </AreaChart>
    ) : (
      <LineChart data={data} accessibilityLayer>
        {showGrid && <CartesianGrid />}
        <XAxis
          dataKey={xDataKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          unit={xAxisUnit}
          hide={!showXAxisLabel}
          {...(xAxisMin != null || xAxisMax != null
            ? {domain: [xAxisMin ?? "auto", xAxisMax ?? "auto"]}
            : {})}
        />
        <YAxis
          hide={!(showYAxis || showYAxisLabel)}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={yAxisUnit ? 48 : 40}
          unit={yAxisUnit}
          domain={[yAxisMin ?? "auto", yAxisMax ?? "auto"]}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {referenceAreaEls}
        {series.map((s) => (
          <Line
            key={s.dataKey}
            type={s.curveType ?? "natural"}
            dataKey={s.dataKey}
            stroke={`var(--color-${s.dataKey})`}
            strokeWidth={s.strokeWidth ?? 2}
            strokeDasharray={s.strokeDasharray}
            dot={s.dot ?? false}
            isAnimationActive={!suppressAnimation}
          />
        ))}
        {referenceLineEls}
      </LineChart>
    );

  // ── ChartContainer wrapper ─────────────────────────────────────────────────

  const container = (
    <ChartContainer config={chartConfig} style={{minHeight: `${height}px`}}>
      {chartEl}
    </ChartContainer>
  );

  // ── Optional Card shell ────────────────────────────────────────────────────
  // Wrap in a shadcn Card only when a title or description is provided.
  // Otherwise render a plain div so the chart can be embedded anywhere.

  if (title || description) {
    return (
      <Card data-pihanga={cardName} className={className}>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{container}</CardContent>
      </Card>
    );
  }

  return (
    <div data-pihanga={cardName} className={className}>
      {container}
    </div>
  );
};
