import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

// `Form` renders its `content` refs via Pihanga's <Card>, which requires
// the full card registry to resolve a cardName to a component. To keep this
// a lightweight unit test of FormComponent itself (submit/cancel/abandon
// lifecycle), we mock <Card> to render a tiny stand-in that reads
// FormContext and exposes buttons wired to `requestAction`, mirroring how a
// real `Button` with `formAction` would behave (see button.component.tsx).
vi.mock("@pihanga2/core", async () => {
  const actual =
    await vi.importActual<typeof import("@pihanga2/core")>("@pihanga2/core");
  const React = await import("react");
  const {useFormContext} = await import("./form.context");

  const CancelProbe = () => {
    const form = useFormContext();
    return React.createElement(
      "button",
      {type: "button", onClick: () => form.requestAction("cancel")},
      "Cancel via context",
    );
  };

  return {
    ...actual,
    Card: (p: {cardName: string}) =>
      p.cardName === "test/cancel-probe" ? React.createElement(CancelProbe) : null,
  };
});

import {FormComponent} from "./form.component";
import type {PiFormEvents, PiFormProps} from "./form.types";

function renderForm(
  props: Partial<PiFormProps> & {
    onSubmitted?: ReturnType<typeof vi.fn>;
    onCancelled?: ReturnType<typeof vi.fn>;
    onAbandoned?: ReturnType<typeof vi.fn>;
  } = {},
) {
  const onSubmitted = props.onSubmitted ?? vi.fn();
  const onCancelled = props.onCancelled ?? vi.fn();
  const onAbandoned = props.onAbandoned ?? vi.fn();
  const full = {
    cardName: "test/form",
    ...props,
    onSubmitted,
    onCancelled,
    onAbandoned,
  } as unknown as PiCardProps<PiFormProps, PiFormEvents>;
  const result = render(<FormComponent {...full} />);
  return {onSubmitted, onCancelled, onAbandoned, ...result};
}

describe("pi/form", () => {
  it("renders the default submit button with submitLabel", () => {
    const {getByText} = renderForm({submitLabel: "Log in"});
    expect(getByText("Log in")).not.toBeNull();
  });

  it("hides the default submit button when hideSubmit is true", () => {
    const {queryByText} = renderForm({hideSubmit: true, submitLabel: "Save"});
    expect(queryByText("Save")).toBeNull();
  });

  it("fires onSubmitted with a snapshot of formData on submit", () => {
    const {getByText, onSubmitted} = renderForm({
      id: "f1",
      initialValues: {email: "a@b.com"},
      submitLabel: "Submit",
    });
    fireEvent.click(getByText("Submit"));
    expect(onSubmitted).toHaveBeenCalledWith({
      id: "f1",
      formData: {email: "a@b.com"},
    });
  });

  it("does not fire onAbandoned after an explicit submit", () => {
    const {getByText, onSubmitted, onAbandoned, unmount} = renderForm({
      submitLabel: "Submit",
    });
    fireEvent.click(getByText("Submit"));
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    unmount();
    expect(onAbandoned).not.toHaveBeenCalled();
  });

  it("fires onAbandoned when unmounted without submit/cancel", () => {
    const {onAbandoned, onSubmitted, onCancelled, unmount} = renderForm({
      id: "f2",
      initialValues: {q: "x"},
    });
    unmount();
    expect(onAbandoned).toHaveBeenCalledWith({id: "f2", formData: {q: "x"}});
    expect(onSubmitted).not.toHaveBeenCalled();
    expect(onCancelled).not.toHaveBeenCalled();
  });

  it("fires onCancelled (not onSubmitted) when a nested control calls requestAction('cancel')", () => {
    const {getByText, onCancelled, onSubmitted} = renderForm({
      id: "f3",
      initialValues: {q: "x"},
      content: ["test/cancel-probe"],
    });
    fireEvent.click(getByText("Cancel via context"));
    expect(onCancelled).toHaveBeenCalledWith({id: "f3", formData: {q: "x"}});
    expect(onSubmitted).not.toHaveBeenCalled();
  });

  it("does not fire onAbandoned after an explicit cancel", () => {
    const {getByText, onCancelled, onAbandoned, unmount} = renderForm({
      content: ["test/cancel-probe"],
    });
    fireEvent.click(getByText("Cancel via context"));
    expect(onCancelled).toHaveBeenCalledTimes(1);
    unmount();
    expect(onAbandoned).not.toHaveBeenCalled();
  });
});
