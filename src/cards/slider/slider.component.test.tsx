import {fireEvent, render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";
import {describe, expect, it, vi} from "vitest";

import {SliderComponent} from "./slider.component";
import type {PiSliderEvents, PiSliderProps} from "./slider.types";

vi.mock("@/components/ui/slider", () => ({
  Slider: ({
    value,
    onPointerDown,
    onValueChange,
    onValueCommit,
    minStepsBetweenThumbs,
  }: {
    value: number[];
    onPointerDown: () => void;
    onValueChange: (value: number[]) => void;
    onValueCommit: (value: number[]) => void;
    minStepsBetweenThumbs?: number;
  }) => (
    <button
      type="button"
      data-testid="slider"
      data-value={value.join(",")}
      data-min-steps={minStepsBetweenThumbs}
      onPointerDown={onPointerDown}
      onClick={() => onValueChange(value.length > 1 ? [2008, 2024] : [30])}
      onPointerUp={() => onValueCommit(value.length > 1 ? [2008, 2024] : [30])}
    />
  ),
}));

function renderSlider(props: Partial<PiSliderProps> = {}) {
  const onChanged = vi.fn();
  const onCommitted = vi.fn();
  const full = {
    cardName: "test/slider",
    ...props,
    onChanged,
    onCommitted,
  } as unknown as PiCardProps<PiSliderProps, PiSliderEvents>;

  return {onChanged, onCommitted, ...render(<SliderComponent {...full} />)};
}

describe("shad/slider ranges", () => {
  it("renders two values and formats the range label", () => {
    const {getByTestId, getByText} = renderSlider({
      value: [2006, 2026],
      label: "Time range",
      minStepsBetweenThumbs: 2,
    });

    expect(getByTestId("slider")).toHaveAttribute("data-value", "2006,2026");
    expect(getByTestId("slider")).toHaveAttribute("data-min-steps", "2");
    expect(getByText("2006 – 2026")).toBeInTheDocument();
  });

  it("dispatches tuple values for changed and committed events", () => {
    const {getByTestId, onChanged, onCommitted} = renderSlider({
      name: "timeRange",
      value: [2006, 2026],
    });
    const slider = getByTestId("slider");

    fireEvent.pointerDown(slider);
    fireEvent.click(slider);
    fireEvent.pointerUp(slider);

    expect(onChanged).toHaveBeenCalledWith({
      name: "timeRange",
      value: [2008, 2024],
    });
    expect(onCommitted).toHaveBeenCalledWith({
      name: "timeRange",
      value: [2008, 2024],
    });
  });

  it("keeps scalar event payloads backward compatible", () => {
    const {getByTestId, onChanged} = renderSlider({value: 20});

    fireEvent.pointerDown(getByTestId("slider"));
    fireEvent.click(getByTestId("slider"));

    expect(onChanged).toHaveBeenCalledWith({
      name: undefined,
      value: 30,
    });
  });
});