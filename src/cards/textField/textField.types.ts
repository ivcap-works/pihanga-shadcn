import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";
import type {FormFieldProps} from "@/cards/form/form.types";

export const PI_TEXT_FIELD_CARD = "pi/text-field";

export const TextField = createCardDeclaration<
  PiTextFieldProps,
  PiTextFieldEvents
>(PI_TEXT_FIELD_CARD);

export const PI_TEXT_FIELD_ACTION = registerActions(PI_TEXT_FIELD_CARD, [
  "changed",
]);

export const onTextFieldChanged = createOnAction<PiTextFieldChangedEvent>(
  PI_TEXT_FIELD_ACTION.CHANGED,
);

/** @deprecated Use `onTextFieldChanged` instead. */
export const onPiTextFieldChanged = onTextFieldChanged;

export type PiTextFieldProps = FormFieldProps & {
  /**
   * Controlled value used in standalone mode (outside a Form).
   * Ignored when `name` is set and the component is inside a pi/form.
   */
  value?: string;

  /** HTML input type (e.g. "text", "email", "password", "number"). */
  type?: string;

  /** Placeholder text shown when the input is empty. */
  placeholder?: string;

  /** When true, the input is disabled and non-interactive. */
  disabled?: boolean;

  /**
   * When true and this field is rendered inside a `pi/form` card, pressing
   * Enter requests the form's submit action
   * (`FormContext.requestAction("submit")`) — equivalent to clicking a
   * `Button` with `formAction: "submit"`.
   *
   * Has no effect outside a `pi/form`.
   * @default false
   */
  submitOnEnter?: boolean;
};

export type PiTextFieldChangedEvent = {
  /** Field name, mirrors the `name` prop if provided. */
  name?: string;
  /** New value after the change. */
  value: string;
};

export type PiTextFieldEvents = {
  onChanged: PiTextFieldChangedEvent;
};
