import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const PI_CHECKBOX_CARD = "pi/checkbox";

export const Checkbox = createCardDeclaration<
  PiCheckboxProps,
  PiCheckboxEvents
>(PI_CHECKBOX_CARD);

export const PI_CHECKBOX_ACTION = registerActions(PI_CHECKBOX_CARD, [
  "changed",
]);

export const onPiCheckboxChanged = createOnAction<PiCheckboxChangedEvent>(
  PI_CHECKBOX_ACTION.CHANGED,
);

export type PiCheckboxProps = {
  /**
   * Field name used to bind to FormContext when inside a pi/form card.
   * When provided the component reads its checked state from form data and
   * writes back via form.handleChange.
   */
  name?: string;

  /**
   * Controlled checked state used in standalone mode (outside a Form).
   * Ignored when `name` is set and the component is inside a pi/form.
   */
  checked?: boolean;

  /** When true, the checkbox is disabled and non-interactive. */
  disabled?: boolean;
};

export type PiCheckboxChangedEvent = {
  /** Field name, mirrors the `name` prop if provided. */
  name?: string;
  /** New checked state after the change. */
  checked: boolean;
};

export type PiCheckboxEvents = {
  onChanged: PiCheckboxChangedEvent;
};
