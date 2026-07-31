import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {CheckboxComponent} from "./checkbox.component";
import type {PiCheckboxEvents, PiCheckboxProps} from "./checkbox.types";
import {FormContext} from "@/cards/form/form.context";

function renderCheckbox(
  props: Partial<PiCheckboxProps> & {
    cardName?: string;
    onChanged?: ReturnType<typeof vi.fn>;
  } = {},
) {
  const onChanged = props.onChanged ?? vi.fn();
  const full = {
    cardName: "test/checkbox",
    ...props,
    onChanged,
  } as unknown as PiCardProps<PiCheckboxProps, PiCheckboxEvents>;
  return {onChanged, ...render(<CheckboxComponent {...full} />)};
}

describe("shad/checkbox (standalone)", () => {
  it("reflects the `checked` prop", () => {
    const {container} = renderCheckbox({checked: true});
    const input = container.querySelector(
      "input[type=checkbox]",
    ) as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it("dispatches onChanged with new state on toggle", () => {
    const {container, onChanged} = renderCheckbox({
      name: "agree",
      checked: false,
    });
    const input = container.querySelector(
      "input[type=checkbox]",
    ) as HTMLInputElement;
    fireEvent.click(input);
    expect(onChanged).toHaveBeenCalledWith({name: "agree", checked: true});
  });

  it("renders a label element linked via htmlFor when label given", () => {
    const {container} = renderCheckbox({label: "Terms", name: "t"});
    const input = container.querySelector("input") as HTMLInputElement;
    const label = container.querySelector("label") as HTMLLabelElement;
    expect(label).not.toBeNull();
    expect(label.getAttribute("for")).toBe(input.id);
    expect(label.textContent).toBe("Terms");
  });

  it("respects disabled prop", () => {
    const {container} = renderCheckbox({disabled: true});
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("wraps root with data-pihanga", () => {
    const {container} = renderCheckbox({cardName: "app/cb"});
    expect(container.querySelector("[data-pihanga='app/cb']")).not.toBeNull();
  });
});

describe("shad/checkbox (inside pi/form)", () => {
  function renderInForm(
    formData: Record<string, unknown>,
    handleChange = vi.fn(),
    checkboxProps: Partial<PiCheckboxProps> = {},
  ) {
    const onChanged = vi.fn();
    const full = {
      cardName: "test/cb",
      name: "agree",
      ...checkboxProps,
      onChanged,
    } as unknown as PiCardProps<PiCheckboxProps, PiCheckboxEvents>;

    const result = render(
      <FormContext.Provider
        value={{
          isInForm: true,
          formData,
          errors: {},
          handleChange,
          setError: () => {},
        }}
      >
        <CheckboxComponent {...full} />
      </FormContext.Provider>,
    );
    return {onChanged, handleChange, ...result};
  }

  it("reads checked state from formData when name is set", () => {
    const {container} = renderInForm({agree: true});
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it("calls form.handleChange on toggle instead of onChanged", () => {
    const {container, handleChange, onChanged} = renderInForm({agree: false});
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.click(input);
    expect(handleChange).toHaveBeenCalledWith("agree", true);
    expect(onChanged).not.toHaveBeenCalled();
  });
});
