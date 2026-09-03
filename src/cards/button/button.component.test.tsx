import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {ButtonComponent} from "./button.component";
import type {PiButtonEvents, PiButtonProps} from "./button.types";
import {FormContext, type FormContextValue} from "@/cards/form/form.context";

function renderButton(
  props: Partial<PiButtonProps> & {onClicked?: ReturnType<typeof vi.fn>} = {},
) {
  const onClicked = props.onClicked ?? vi.fn();
  const full = {
    cardName: "test/btn",
    _cls: () => "",
    ...props,
    onClicked,
  } as unknown as PiCardProps<PiButtonProps, PiButtonEvents>;
  return {onClicked, ...render(<ButtonComponent {...full} />)};
}

function renderButtonInForm(
  props: Partial<PiButtonProps> = {},
  formOverrides: Partial<FormContextValue> = {},
) {
  const onClicked = vi.fn();
  const requestAction = formOverrides.requestAction ?? vi.fn();
  const full = {
    cardName: "test/btn",
    _cls: () => "",
    ...props,
    onClicked,
  } as unknown as PiCardProps<PiButtonProps, PiButtonEvents>;

  const result = render(
    <FormContext.Provider
      value={{
        formData: {},
        errors: {},
        handleChange: () => {},
        setError: () => {},
        requestAction,
        isInForm: true,
        ...formOverrides,
      }}
    >
      <ButtonComponent {...full} />
    </FormContext.Provider>,
  );
  return {onClicked, requestAction, ...result};
}

describe("pi/button (standalone)", () => {
  it("dispatches onClicked with id on click", () => {
    const {getByText, onClicked} = renderButton({id: "save", label: "Save"});
    fireEvent.click(getByText("Save"));
    expect(onClicked).toHaveBeenCalledWith({id: "save"});
  });

  it("renders native type=button when formAction is unset (outside a form)", () => {
    const {container} = renderButton({label: "Save"});
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.type).toBe("button");
  });

  it("still fires onClicked (not requestAction) when formAction is set but outside a form", () => {
    const {getByText, onClicked} = renderButton({
      id: "confirm",
      label: "Confirm",
      formAction: "submit",
    });
    fireEvent.click(getByText("Confirm"));
    expect(onClicked).toHaveBeenCalledWith({id: "confirm"});
  });
});

describe("pi/button (inside pi/form)", () => {
  it("formAction: 'submit' renders native type=submit and calls requestAction('submit') instead of onClicked", () => {
    const {getByText, onClicked, requestAction, container} =
      renderButtonInForm({id: "confirm", label: "Confirm", formAction: "submit"});
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.type).toBe("submit");
    fireEvent.click(getByText("Confirm"));
    expect(requestAction).toHaveBeenCalledWith("submit");
    expect(onClicked).not.toHaveBeenCalled();
  });

  it("formAction: 'cancel' renders native type=button and calls requestAction('cancel') instead of onClicked", () => {
    const {getByText, onClicked, requestAction, container} =
      renderButtonInForm({id: "cancel", label: "Cancel", formAction: "cancel"});
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.type).toBe("button");
    fireEvent.click(getByText("Cancel"));
    expect(requestAction).toHaveBeenCalledWith("cancel");
    expect(onClicked).not.toHaveBeenCalled();
  });

  it("without formAction, still dispatches its own onClicked even inside a form", () => {
    const {getByText, onClicked, requestAction} = renderButtonInForm({
      id: "plain",
      label: "Plain",
    });
    fireEvent.click(getByText("Plain"));
    expect(onClicked).toHaveBeenCalledWith({id: "plain"});
    expect(requestAction).not.toHaveBeenCalled();
  });
});
