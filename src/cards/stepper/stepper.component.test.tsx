import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

vi.mock("@pihanga2/core", async () => {
  const React = await import("react");
  return {
    Card: ({cardName}: {cardName: string}) =>
      React.createElement("span", {"data-child": cardName}, cardName),
  };
});

import {StepperComponent} from "./stepper.component";
import type {StepperEvents, StepperProps} from "./stepper.types";

const steps = [
  {id: "one", title: "One"},
  {id: "two", title: "Two"},
  {id: "three", title: "Three"},
];

function renderStepper(
  props: Partial<StepperProps> & {cardName?: string} = {},
  onStepClicked = vi.fn(),
) {
  const full = {
    cardName: "test/stp",
    steps,
    ...props,
    onStepClicked,
  } as unknown as PiCardProps<StepperProps, StepperEvents>;
  return {onStepClicked, ...render(<StepperComponent {...full} />)};
}

describe("shad/stepper", () => {
  it("renders one label per step", () => {
    const {getByText} = renderStepper();
    expect(getByText("One")).toBeInTheDocument();
    expect(getByText("Two")).toBeInTheDocument();
    expect(getByText("Three")).toBeInTheDocument();
  });

  it("data-pihanga on root", () => {
    const {container} = renderStepper({cardName: "app/stp"});
    expect(container.querySelector("[data-pihanga='app/stp']")).not.toBeNull();
  });

  it("clicking a step indicator emits onStepClicked({stepIndex, stepId})", () => {
    const {container, onStepClicked} = renderStepper({selfManaged: true});
    // Only the indicator button is clickable — pick the 2nd button
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[1]);
    expect(onStepClicked).toHaveBeenCalledWith(
      expect.objectContaining({stepIndex: 1, stepId: "two"}),
    );
  });
});
