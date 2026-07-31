import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {ToggleGroupComponent} from "./toggleGroup.component";
import type {
  PiToggleGroupEvents,
  PiToggleGroupProps,
} from "./toggleGroup.types";
import {FormContext} from "@/cards/form/form.context";

function renderTG(
  props: Partial<PiToggleGroupProps> & {cardName?: string} = {},
  onChanged = vi.fn(),
) {
  const full = {
    cardName: "test/tg",
    items: [
      {value: "a", label: "A"},
      {value: "b", label: "B"},
      {value: "c", label: "C"},
    ],
    ...props,
    onChanged,
  } as unknown as PiCardProps<PiToggleGroupProps, PiToggleGroupEvents>;
  return {onChanged, ...render(<ToggleGroupComponent {...full} />)};
}

describe("shad/toggle-group", () => {
  it("renders one item per entry", () => {
    const {getByText} = renderTG();
    expect(getByText("A")).toBeInTheDocument();
    expect(getByText("B")).toBeInTheDocument();
    expect(getByText("C")).toBeInTheDocument();
  });

  it("clicking an item (single mode) fires onChanged with new value", () => {
    const {getByText, onChanged} = renderTG({
      type: "single",
      value: "",
      selfManaged: true,
    });
    fireEvent.click(getByText("B"));
    expect(onChanged).toHaveBeenCalledWith(
      expect.objectContaining({value: "b"}),
    );
  });

  it("multiple mode fires an array value", () => {
    const {getByText, onChanged} = renderTG({
      type: "multiple",
      value: [],
      selfManaged: true,
    });
    fireEvent.click(getByText("A"));
    expect(onChanged).toHaveBeenCalledWith(
      expect.objectContaining({value: ["a"]}),
    );
  });

  it("pill variant adds PILL_CLASS on container", () => {
    const {container} = renderTG({variant: "pill", value: "a"});
    const root = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(root.className).toContain("rounded-full");
  });

  it("data-pihanga on root", () => {
    const {container} = renderTG({cardName: "app/tg"});
    expect(container.querySelector("[data-pihanga='app/tg']")).not.toBeNull();
  });

  it("inside pi/form: reads value + calls handleChange", () => {
    const handleChange = vi.fn();
    const {getByText} = render(
      <FormContext.Provider
        value={{
          isInForm: true,
          formData: {choice: "a"},
          errors: {},
          handleChange,
          setError: () => {},
        }}
      >
        <ToggleGroupComponent
          {...({
            cardName: "test/tg",
            name: "choice",
            items: [
              {value: "a", label: "A"},
              {value: "b", label: "B"},
            ],
            type: "single",
            onChanged: vi.fn(),
          } as unknown as PiCardProps<PiToggleGroupProps, PiToggleGroupEvents>)}
        />
      </FormContext.Provider>,
    );
    fireEvent.click(getByText("B"));
    expect(handleChange).toHaveBeenCalledWith("choice", "b");
  });
});
