import {render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";
import {describe, expect, it, vi} from "vitest";

vi.mock("@pihanga2/core", async () => {
  const React = await import("react");
  return {
    Card: ({cardName}: {cardName: string}) =>
      React.createElement("span", {"data-footer-card": cardName}),
  };
});

import {ChartGraphComponent} from "./chart.component";
import type {PiChartGraphProps} from "./chart.types";

describe("shad/chart-graph bars", () => {
  it("renders bar geometry", () => {
    const chartProps = {
      chartType: "bar",
      data: [
        {year: 2024, count: 10},
        {year: 2025, count: 20},
      ],
      series: [{dataKey: "count", color: "var(--chart-1)"}],
      xDataKey: "year",
      showLegend: false,
      showGrid: false,
      suppressAnimation: true,
      barRadius: 3,
      footerCard: "test/range-slider",
    } satisfies PiChartGraphProps;

    const props = {
      cardName: "test/chart",
      ...chartProps,
    } as unknown as PiCardProps<PiChartGraphProps>;

    const {container} = render(<ChartGraphComponent {...props} />);

    expect(container.querySelector(".recharts-bar")).not.toBeNull();
    expect(container.querySelectorAll(".recharts-rectangle").length).toBeGreaterThan(0);
    expect(container.querySelector("[data-footer-card='test/range-slider']")).not.toBeNull();
  });

  it("does not crash while chart props are temporarily incomplete", () => {
    const props = {
      cardName: "test/incomplete-chart",
      chartType: "bar",
    } as unknown as PiCardProps<PiChartGraphProps>;

    expect(() => render(<ChartGraphComponent {...props} />)).not.toThrow();
  });

  it("makes titled charts fill their available width", () => {
    const props = {
      cardName: "test/titled-chart",
      chartType: "line",
      data: [{month: "Jan", count: 10}],
      series: [{dataKey: "count"}],
      xDataKey: "month",
      title: "Desktop Visits",
      description: "Monthly desktop page views",
      suppressAnimation: true,
    } as unknown as PiCardProps<PiChartGraphProps>;

    const {container} = render(<ChartGraphComponent {...props} />);

    expect(container.querySelector("[data-slot='card']")).toHaveClass(
      "w-full",
      "min-w-0",
    );
    expect(container.querySelector("[data-slot='chart']")).toHaveClass(
      "w-full",
      "min-w-0",
      "max-w-full",
      "overflow-hidden",
    );
  });
});