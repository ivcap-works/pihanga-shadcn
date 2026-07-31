import {describe, expect, it} from "vitest";
import {render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {SliderValueComponent} from "./sliderValue.component";
import type {PiSliderValueProps} from "./sliderValue.types";

function renderSV(
  props: Partial<PiSliderValueProps> & {cardName?: string} = {},
) {
  const full = {
    cardName: "test/sv",
    value: 50,
    ...props,
  } as unknown as PiCardProps<PiSliderValueProps>;
  return render(<SliderValueComponent {...full} />);
}

function fillEl(container: HTMLElement) {
  return container.querySelector("[style*='width']") as HTMLElement | null;
}

describe("shad/slider-value", () => {
  it("renders label and clamped value", () => {
    const {getByText} = renderSV({value: 30, label: "Volume"});
    expect(getByText("Volume")).toBeInTheDocument();
    expect(getByText("30")).toBeInTheDocument();
  });

  it.each([
    [0, 0, 100, "0%"],
    [50, 0, 100, "50%"],
    [100, 0, 100, "100%"],
    [5, 0, 10, "50%"],
    [-10, 0, 100, "0%"], // clamp low
    [200, 0, 100, "100%"], // clamp high
  ])("value=%s, min=%s, max=%s -> width=%s", (value, min, max, expected) => {
    const {container} = renderSV({value, min, max, label: "x"});
    const fill = fillEl(container);
    expect(fill?.style.width).toBe(expected);
  });

  it("degenerate range (min===max) yields 0%", () => {
    const {container} = renderSV({value: 5, min: 5, max: 5, label: "x"});
    const fill = fillEl(container);
    expect(fill?.style.width).toBe("0%");
  });

  it("data-pihanga is set", () => {
    const {container} = renderSV({cardName: "app/sv", value: 1});
    expect(container.querySelector("[data-pihanga='app/sv']")).not.toBeNull();
  });
});
