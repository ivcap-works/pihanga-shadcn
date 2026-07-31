import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {InputComponent} from "./input.component";
import type {PiInputEvents, PiInputProps} from "./input.types";
import {FormContext} from "@/cards/form/form.context";

function renderInput(
  props: Partial<PiInputProps> & {cardName?: string} = {},
  onChanged = vi.fn(),
  onCommitted = vi.fn(),
) {
  const full = {
    cardName: "test/in",
    ...props,
    onChanged,
    onCommitted,
  } as unknown as PiCardProps<PiInputProps, PiInputEvents>;
  return {
    onChanged,
    onCommitted,
    ...render(<InputComponent {...full} />),
  };
}

describe("shad/input (standalone)", () => {
  it("renders label + input + description with aria-describedby link", () => {
    const {container} = renderInput({
      label: "Email",
      description: "Your login email",
      value: "",
      name: "email",
    });
    const input = container.querySelector("input") as HTMLInputElement;
    const describedBy = input.getAttribute("aria-describedby")!;
    const desc = container.querySelector(`[id="${describedBy}"]`);
    expect(desc?.textContent).toBe("Your login email");
    expect(describedBy).toBe(`${input.id}-desc`);
  });

  it("emits onChanged on typing (standalone)", () => {
    const {container, onChanged} = renderInput({name: "email"});
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, {target: {value: "hi"}});
    expect(onChanged).toHaveBeenCalledWith({name: "email", value: "hi"});
  });

  it("emits onCommitted on blur", () => {
    const {container, onCommitted} = renderInput({name: "email"});
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, {target: {value: "hi"}});
    fireEvent.blur(input);
    expect(onCommitted).toHaveBeenCalledWith({name: "email", value: "hi"});
  });

  it("emits onCommitted on Enter", () => {
    const {container, onCommitted} = renderInput({name: "email"});
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, {target: {value: "abc"}});
    fireEvent.keyDown(input, {key: "Enter"});
    expect(onCommitted).toHaveBeenCalledWith({name: "email", value: "abc"});
  });

  it("data-pihanga is set", () => {
    const {container} = renderInput({cardName: "app/in"});
    expect(container.querySelector("[data-pihanga='app/in']")).not.toBeNull();
  });
});

describe("shad/input (inside pi/form)", () => {
  it("reads value from formData and calls handleChange", () => {
    const handleChange = vi.fn();
    const {container} = render(
      <FormContext.Provider
        value={{
          isInForm: true,
          formData: {email: "u@x"},
          errors: {},
          handleChange,
          setError: () => {},
        }}
      >
        <InputComponent
          {...({
            cardName: "test/in",
            name: "email",
            onChanged: vi.fn(),
            onCommitted: vi.fn(),
          } as unknown as PiCardProps<PiInputProps, PiInputEvents>)}
        />
      </FormContext.Provider>,
    );
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("u@x");
    fireEvent.change(input, {target: {value: "u2@x"}});
    expect(handleChange).toHaveBeenCalledWith("email", "u2@x");
  });
});
