import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {SwitchComponent} from "./switch.component";
import type {PiSwitchEvents, PiSwitchProps} from "./switch.types";
import {FormContext} from "@/cards/form/form.context";

function renderSwitch(
  props: Partial<PiSwitchProps> & {cardName?: string} = {},
  onChanged = vi.fn(),
) {
  const full = {
    cardName: "test/sw",
    ...props,
    onChanged,
  } as unknown as PiCardProps<PiSwitchProps, PiSwitchEvents>;
  return {onChanged, ...render(<SwitchComponent {...full} />)};
}

describe("shad/switch (standalone)", () => {
  it("renders label + switch and reflects checked prop", () => {
    const {getByText, container} = renderSwitch({
      label: "Wifi",
      checked: true,
    });
    expect(getByText("Wifi")).toBeInTheDocument();
    const sw = container.querySelector("[role='switch']") as HTMLElement;
    expect(sw.getAttribute("data-state")).toBe("checked");
  });

  it("data-pihanga is present", () => {
    const {container} = renderSwitch({cardName: "app/sw"});
    expect(container.querySelector("[data-pihanga='app/sw']")).not.toBeNull();
  });

  it("dispatches onChanged when toggled", () => {
    const {container, onChanged} = renderSwitch({name: "wifi", checked: false});
    const sw = container.querySelector("[role='switch']") as HTMLElement;
    fireEvent.click(sw);
    expect(onChanged).toHaveBeenCalledWith({name: "wifi", checked: true});
  });

  it("respects disabled prop", () => {
    const {container} = renderSwitch({disabled: true});
    const sw = container.querySelector("[role='switch']") as HTMLElement;
    expect(sw.getAttribute("data-disabled")).not.toBeNull();
  });

  it("selfManaged tracks internal state and still emits onChanged", () => {
    const {container, onChanged} = renderSwitch({
      selfManaged: true,
      checked: false,
    });
    const sw = container.querySelector("[role='switch']") as HTMLElement;
    fireEvent.click(sw);
    expect(onChanged).toHaveBeenCalledTimes(1);
    expect(sw.getAttribute("data-state")).toBe("checked");
  });
});

describe("shad/switch (inside pi/form)", () => {
  it("reads value from formData and dispatches handleChange", () => {
    const handleChange = vi.fn();
    const {container} = render(
      <FormContext.Provider
        value={{
          isInForm: true,
          formData: {wifi: true},
          errors: {},
          handleChange,
          setError: () => {},
        }}
      >
        <SwitchComponent
          {...({
            cardName: "test/sw",
            name: "wifi",
            onChanged: vi.fn(),
          } as unknown as PiCardProps<PiSwitchProps, PiSwitchEvents>)}
        />
      </FormContext.Provider>,
    );
    const sw = container.querySelector("[role='switch']") as HTMLElement;
    expect(sw.getAttribute("data-state")).toBe("checked");
    fireEvent.click(sw);
    expect(handleChange).toHaveBeenCalledWith("wifi", false);
  });
});
