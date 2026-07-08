/**
 * Playground definition for the `shad/chart-graph` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {Chart, type PiChartGraphProps} from "./index";

// ---------------------------------------------------------------------------
// Shared sample datasets
// ---------------------------------------------------------------------------

const MONTHLY_DATA = [
  {month: "Jan", desktop: 186, mobile: 80},
  {month: "Feb", desktop: 305, mobile: 200},
  {month: "Mar", desktop: 237, mobile: 120},
  {month: "Apr", desktop: 273, mobile: 190},
  {month: "May", desktop: 209, mobile: 130},
  {month: "Jun", desktop: 214, mobile: 140},
];

const SINGLE_LINE_SERIES = [
  {
    dataKey: "desktop",
    label: "Desktop",
    color: "var(--chart-1)",
    curveType: "natural" as const,
    strokeWidth: 2,
    strokeDasharray: undefined,
    dot: false,
  },
];

const SINGLE_AREA_SERIES = [
  {
    dataKey: "desktop",
    label: "Desktop",
    color: "var(--chart-1)",
    curveType: "natural" as const,
    strokeWidth: 2,
    strokeDasharray: undefined,
    dot: false,
    fillColor: "var(--chart-1)",
    fillOpacity: 0.4,
  },
];

const MULTI_LINE_SERIES = [
  {
    dataKey: "desktop",
    label: "Desktop",
    color: "var(--chart-1)",
    curveType: "natural" as const,
    strokeWidth: 2,
    strokeDasharray: undefined,
    dot: false,
  },
  {
    dataKey: "mobile",
    label: "Mobile",
    color: "var(--chart-2)",
    curveType: "natural" as const,
    strokeWidth: 2,
    strokeDasharray: undefined,
    dot: false,
  },
];

const MULTI_AREA_SERIES = [
  {
    dataKey: "desktop",
    label: "Desktop",
    color: "var(--chart-1)",
    curveType: "natural" as const,
    strokeWidth: 2,
    strokeDasharray: undefined,
    dot: false,
    fillColor: "var(--chart-1)",
    fillOpacity: 0.4,
  },
  {
    dataKey: "mobile",
    label: "Mobile",
    color: "var(--chart-2)",
    curveType: "natural" as const,
    strokeWidth: 2,
    strokeDasharray: undefined,
    dot: false,
    fillColor: "var(--chart-2)",
    fillOpacity: 0.4,
  },
];

export default definePlayground<PiChartGraphProps>({
  cardId: "shad/chart-graph",
  title: "Chart",

  preview: (props) => Chart(props),

  defaultProps: {
    chartType: "line",
    data: MONTHLY_DATA,
    series: SINGLE_LINE_SERIES,
    xDataKey: "month",
    showLegend: true,
    showGrid: true,
    showXAxisLabel: true,
    showYAxis: false,
    showYAxisLabel: false,
    yAxisUnit: "",
    xAxisUnit: "",
    stacked: false,
    fillOpacity: 0.4,
    suppressAnimation: false,
    height: 250,
  },

  facets: [
    {
      id: "line",
      title: "Line",
      description:
        "A basic single-series line chart.  Ideal for showing a continuous trend over time.",
      props: {
        chartType: "line",
        data: MONTHLY_DATA,
        series: SINGLE_LINE_SERIES,
        xDataKey: "month",
        title: "Desktop Visits",
        description: "Monthly desktop page views",
      },
    },
    {
      id: "area",
      title: "Area",
      description:
        "A filled area chart emphasising the magnitude of the values beneath the line.",
      props: {
        chartType: "area",
        data: MONTHLY_DATA,
        series: SINGLE_AREA_SERIES,
        xDataKey: "month",
        title: "Desktop Visits",
        description: "Monthly desktop page views",
      },
    },
    {
      id: "multi-line",
      title: "Multi-series line",
      description:
        "Two series on one line chart — useful for comparing trends side by side.",
      props: {
        chartType: "line",
        data: MONTHLY_DATA,
        series: MULTI_LINE_SERIES,
        xDataKey: "month",
        title: "Visits by Device",
        description: "Desktop vs mobile page views",
      },
    },
    {
      id: "multi-area",
      title: "Multi-series area",
      description:
        "Overlapping filled areas for direct volume comparison between two series.",
      props: {
        chartType: "area",
        data: MONTHLY_DATA,
        series: MULTI_AREA_SERIES,
        xDataKey: "month",
        title: "Visits by Device",
        description: "Desktop vs mobile page views",
        stacked: false,
      },
    },
    {
      id: "stacked-area",
      title: "Stacked area",
      description:
        "Stacked areas show both individual contributions and the cumulative total at a glance.",
      props: {
        chartType: "area",
        data: MONTHLY_DATA,
        series: MULTI_AREA_SERIES,
        xDataKey: "month",
        title: "Total Visits",
        description: "Desktop + mobile (stacked)",
        stacked: true,
      },
    },
    {
      id: "with-y-axis",
      title: "With Y axis",
      description:
        "Set `showYAxis: true` to display numeric tick labels on the left edge — useful when the absolute values matter as much as the trend.",
      props: {
        chartType: "line",
        data: MONTHLY_DATA,
        series: MULTI_LINE_SERIES,
        xDataKey: "month",
        title: "Visits by Device",
        description: "With y-axis labels",
        showYAxis: true,
      },
    },
    {
      id: "with-units",
      title: "With units",
      description:
        '`yAxisUnit` appends a string to every y-axis tick (e.g. `" k"` → `"186 k"`). `xAxisUnit` does the same for the x-axis — handy for numeric x values.',
      props: {
        chartType: "area",
        data: MONTHLY_DATA,
        series: MULTI_AREA_SERIES,
        xDataKey: "month",
        title: "Visits by Device",
        description: 'Y axis with " views" unit suffix',
        showYAxis: true,
        yAxisUnit: " k",
        stacked: false,
      },
    },
    {
      id: "reference-lines",
      title: "Reference lines",
      description:
        "Use `referenceLines` to overlay horizontal or vertical markers on the chart — thresholds, targets, event markers, etc.",
      props: {
        chartType: "line",
        data: MONTHLY_DATA,
        series: MULTI_LINE_SERIES,
        xDataKey: "month",
        title: "Visits by Device",
        description: "With threshold and event markers",
        showYAxis: true,
        referenceLines: [
          {
            y: 200,
            label: "Target",
            stroke: "var(--chart-3)",
            strokeDasharray: "4 4",
          },
          {x: "Mar", label: "Launch", stroke: "var(--chart-4)"},
        ],
      },
    },
    {
      id: "reference-areas",
      title: "Reference areas",
      description:
        "Use `referenceAreas` to highlight rectangular regions — y-bands for value ranges, x-bands for time windows, or a combined rectangle.",
      props: {
        chartType: "line",
        data: MONTHLY_DATA,
        series: MULTI_LINE_SERIES,
        xDataKey: "month",
        title: "Visits by Device",
        description: "With highlighted target range and period",
        showYAxis: true,
        referenceAreas: [
          {
            y1: 180,
            y2: 280,
            fill: "var(--chart-3)",
            fillOpacity: 0.15,
            label: "Target",
          },
          {x1: "Feb", x2: "Apr", fill: "var(--chart-4)", fillOpacity: 0.1},
        ],
      },
    },
    {
      id: "bare",
      title: "Bare (no card)",
      description:
        "Without `title` or `description` the component renders as a plain div — ready to embed in your own layout.",
      props: {
        chartType: "line",
        data: MONTHLY_DATA,
        series: MULTI_LINE_SERIES,
        xDataKey: "month",
      },
    },
  ],

  controls: [
    {
      prop: "chartType",
      type: "token",
      label: "Chart type",
      options: ["line", "area"],
    },
    {
      prop: "title",
      type: "text",
      label: "Title",
      placeholder: "e.g. Monthly Visits",
    },
    {
      prop: "description",
      type: "text",
      label: "Description",
      placeholder: "e.g. subtitle text",
    },
    {prop: "showLegend", type: "boolean", label: "Show legend"},
    {prop: "showGrid", type: "boolean", label: "Show grid"},
    {prop: "showXAxisLabel", type: "boolean", label: "Show X axis"},
    {prop: "showYAxis", type: "boolean", label: "Show Y axis"},
    {prop: "yAxisMin", type: "number", label: "Y axis min"},
    {prop: "yAxisMax", type: "number", label: "Y axis max"},
    {prop: "xAxisMin", type: "number", label: "X axis min"},
    {prop: "xAxisMax", type: "number", label: "X axis max"},
    {
      prop: "yAxisUnit",
      type: "text",
      label: "Y axis unit",
      placeholder: 'e.g. "ms" or "%"',
    },
    {
      prop: "xAxisUnit",
      type: "text",
      label: "X axis unit",
      placeholder: 'e.g. "s"',
    },
    {prop: "stacked", type: "boolean", label: "Stacked (area)"},
    {prop: "fillOpacity", type: "number", label: "Fill opacity"},
    {prop: "suppressAnimation", type: "boolean", label: "Suppress animation"},
    {prop: "height", type: "number", label: "Height (px)"},
  ],

  note: `
**Single-series line chart**

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {Chart} from "@/cards/chart";

registerCard("myApp/visitsChart", Chart({
  chartType: "line",
  xDataKey: "month",
  data: [
    {month: "Jan", visits: 186},
    {month: "Feb", visits: 305},
    {month: "Mar", visits: 237},
  ],
  series: [{dataKey: "visits", label: "Visits"}],
  title: "Monthly Visits",
  description: "Page views over the last 3 months",
}));
\`\`\`

**Multi-series stacked area chart with custom colours**

\`\`\`ts
registerCard("myApp/deviceChart", Chart({
  chartType: "area",
  xDataKey: "month",
  data: [
    {month: "Jan", desktop: 186, mobile: 80},
    {month: "Feb", desktop: 305, mobile: 200},
    {month: "Mar", desktop: 237, mobile: 120},
  ],
  series: [
    {dataKey: "desktop", label: "Desktop", color: "var(--chart-1)"},
    {dataKey: "mobile",  label: "Mobile",  color: "var(--chart-2)"},
  ],
  stacked: true,
  fillOpacity: 0.5,
  title: "Visits by Device",
}));
\`\`\`

**Driven by state (live data)**

\`\`\`ts
import {memo, register, registerCard} from "@pihanga2/core";
import {Chart} from "@/cards/chart";
import type {AppState} from "@/app.state";

registerCard("myApp/liveChart", Chart({
  chartType: "line",
  xDataKey: "ts",
  data:   memo((s: AppState) => s.metrics),
  series: [{dataKey: "value", label: "Value"}],
  title:  memo((s: AppState) => \`Metric: \${s.selectedMetric}\`),
}));
\`\`\`

**Reference lines — threshold and event markers**

\`\`\`ts
import {Chart} from "@/cards/chart";

registerCard("myApp/thresholdChart", Chart({
  chartType: "line",
  xDataKey: "month",
  data: [...],
  series: [{dataKey: "value", label: "Value"}],
  showYAxis: true,
  referenceLines: [
    // Horizontal threshold (dashed)
    {y: 250, label: "Limit", stroke: "red", strokeDasharray: "4 4"},
    // Vertical event marker (solid)
    {x: "Mar", label: "Launch", stroke: "var(--chart-2)"},
    // Object-form label for full positioning control
    {y: 100, stroke: "orange", label: {value: "Min", position: "insideRight", fill: "orange"}},
  ],
}));
\`\`\`

**Reference areas — highlighted bands and regions**

\`\`\`ts
registerCard("myApp/bandChart", Chart({
  chartType: "line",
  xDataKey: "month",
  data: [...],
  series: [{dataKey: "value", label: "Value"}],
  showYAxis: true,
  referenceAreas: [
    // Horizontal y-band (target range)
    {y1: 100, y2: 200, fill: "var(--chart-3)", fillOpacity: 0.15, label: "Target"},
    // Vertical x-band (highlight a time window)
    {x1: "Feb", x2: "Apr", fill: "var(--chart-4)", fillOpacity: 0.1},
    // Combined rectangle with a border
    {x1: "May", x2: "Jun", y1: 150, y2: 300, fill: "var(--chart-5)", stroke: "var(--chart-5)", strokeWidth: 1},
  ],
}));
\`\`\`
  `.trim(),
});
