import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {TextFieldComponent} from "./textField.component";
import type {PiTextFieldEvents, PiTextFieldProps} from "./textField.types";
import {FormContext} from "@/cards/form/form.context";

function makeProps(
  props: Partial<PiTextFieldProps> = {},
  onChanged: ReturnType<typeof vi.fn> = vi.fn(),
) {
  const full = {
    cardName: "test/tf",
    ...props,
    onChanged,
  } as unknown as PiCardProps<PiTextFieldProps, PiTextFieldEvents>;
  return {full, onChanged};
}

describe("shad/text-field (standalone)", () => {
  it("renders `value` from prop", () => {
    const {full} = makeProps({value: "hello"});
    const {container} = render(<TextFieldComponent {...full} />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  it("dispatches onChanged({name,value}) on input", () => {
    const {full, onChanged} = makeProps({name: "email", value: ""});
    const {container} = render(<TextFieldComponent {...full} />);
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, {target: {value: "a@b"}});
    expect(onChanged).toHaveBeenCalledWith({name: "email", value: "a@b"});
  });

  it("uses provided `type` and `placeholder`", () => {
    const {full} = makeProps({type: "password", placeholder: "pw"});
    const {container} = render(<TextFieldComponent {...full} />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.type).toBe("password");
    expect(input.placeholder).toBe("pw");
  });

  it("respects `disabled`", () => {
    const {full} = makeProps({disabled: true});
    const {container} = render(<TextFieldComponent {...full} />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});

describe("shad/text-field (inside pi/form)", () => {
  it("reads value from formData when name is set", () => {
    const {full} = makeProps({name: "email"});
    const {container} = render(
      <FormContext.Provider
        value={{
          isInForm: true,
          formData: {email: "a@b.com"},
          errors: {},
          handleChange: vi.fn(),
          setError: () => {},
        }}
      >
        <TextFieldComponent {...full} />
      </FormContext.Provider>,
    );
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("a@b.com");
  });

  it("calls form.handleChange instead of onChanged", () => {
    const handleChange = vi.fn();
    const {full, onChanged} = makeProps({name: "email"});
    const {container} = render(
      <FormContext.Provider
        value={{
          isInForm: true,
          formData: {email: ""},
          errors: {},
          handleChange,
          setError: () => {},
        }}
      >
        <TextFieldComponent {...full} />
      </FormContext.Provider>,
    );
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, {target: {value: "hi"}});
    expect(handleChange).toHaveBeenCalledWith("email", "hi");
    expect(onChanged).not.toHaveBeenCalled();
  });
});
