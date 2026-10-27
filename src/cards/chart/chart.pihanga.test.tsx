import {act, waitFor} from "@testing-library/react";
import {Provider} from "react-redux";
import {
  Card,
  DEFAULT_REDUX_STATE,
  registerCard,
  start,
} from "@pihanga2/core";
import type {Store} from "@reduxjs/toolkit";
import {describe, expect, it} from "vitest";

import {Chart} from "./index";
import {Slider} from "@/cards/slider";

const SLIDER_CARD = "test/chart-footer-slider";
const CHART_CARD = "test/chart-with-slider";

registerCard(
  SLIDER_CARD,
  Slider({
    defaultValue: [2006, 2026],
    min: 2006,
    max: 2026,
    selfManaged: true,
  }),
);

registerCard(
  CHART_CARD,
  Chart({
    chartType: "bar",
    data: [
      {year: 2024, count: 10},
      {year: 2025, count: 20},
    ],
    series: [{dataKey: "count", color: "#93c5e8"}],
    xDataKey: "year",
    height: 120,
    showLegend: false,
    showGrid: false,
    suppressAnimation: true,
    footerCard: SLIDER_CARD,
  }),
);

function Root(store: Store) {
  return (
    <Provider store={store}>
      <Card cardName={CHART_CARD} parentCard="" />
    </Provider>
  );
}

describe("chart through the Pihanga card runtime", () => {
  it("renders bars and its slider footer together", async () => {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    globalThis.ResizeObserver = ResizeObserverMock;
    Element.prototype.getBoundingClientRect = () => ({
      width: 640,
      height: 120,
      top: 0,
      right: 640,
      bottom: 120,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    document.body.innerHTML = '<div id="root"></div>';
    await act(async () => {
      start(DEFAULT_REDUX_STATE, [], {rootComponent: Root});
    });

    await waitFor(() => {
      expect(document.querySelector(".recharts-bar")).not.toBeNull();
      expect(document.querySelectorAll(".recharts-rectangle").length).toBeGreaterThan(0);
      expect(document.querySelectorAll("[data-slot='slider-thumb']")).toHaveLength(2);
    });
  });
});