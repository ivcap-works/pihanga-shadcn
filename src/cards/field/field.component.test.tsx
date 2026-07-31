import {describe, expect, it, vi} from "vitest";
import {render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

vi.mock("@pihanga2/core", async () => {
  const React = await import("react");
  return {
    Card: (p: {cardName: string; id?: string; invalid?: boolean}) =>
      React.createElement("span", {
        "data-child": p.cardName,
        "data-injected-id": p.id ?? "",
        "data-injected-invalid": p.invalid ? "true" : "false",
      }),
  };
});

import {FieldCardComponent} from "./field.component";
import type {PiFieldProps} from "./field.types";
import {FormContext} from "@/cards/form/form.context";

function renderField(props: Partial<PiFieldProps> & {cardName?: string} = {}) {
  const full = {
    cardName: "test/f",
    label: "Name",
    fieldCard: "app/input",
    ...props,
  } as unknown as PiCardProps<PiFieldProps>;
  return render(<FieldCardComponent {...full} />);
}

describe("shad/field", () => {
  it("renders label + description", () => {
    const {getByText} = renderField({description: "Your full name"});
    expect(getByText("Name")).toBeInTheDocument();
    expect(getByText("Your full name")).toBeInTheDocument();
  });

  it("attaches data-pihanga", () => {
    const {container} = renderField({cardName: "app/f"});
    expect(container.querySelector("[data-pihanga='app/f']")).not.toBeNull();
  });

  it("injects id into fieldCard so <label htmlFor> matches", () => {
    const {container} = renderField();
    const label = container.querySelector("label") as HTMLLabelElement;
    const child = container.querySelector("[data-child='app/input']");
    expect(child?.getAttribute("data-injected-id")).toBe(
      label.getAttribute("for"),
    );
  });

  it("renders propError via FieldError", () => {
    const {getByText} = renderField({error: "Required"});
    expect(getByText("Required")).toBeInTheDocument();
  });

  it("injects invalid=true into fieldCard when there's an error", () => {
    const {container} = renderField({error: "Bad"});
    const child = container.querySelector("[data-child]");
    expect(child?.getAttribute("data-injected-invalid")).toBe("true");
  });

  it("uses form errors when inside pi/form + name set", () => {
    const {getByText} = render(
      <FormContext.Provider
        value={{
          isInForm: true,
          formData: {},
          errors: {email: "invalid email"},
          handleChange: () => {},
          setError: () => {},
        }}
      >
        <FieldCardComponent
          {...({
            cardName: "test/f",
            label: "Email",
            fieldCard: "app/i",
            name: "email",
          } as unknown as PiCardProps<PiFieldProps>)}
        />
      </FormContext.Provider>,
    );
    expect(getByText("invalid email")).toBeInTheDocument();
  });
});
