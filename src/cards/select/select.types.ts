import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const PI_SELECT_CARD = "pi/select";

export const Select = createCardDeclaration<PiSelectProps, PiSelectEvents>(
  PI_SELECT_CARD,
);

export const PI_SELECT_ACTION = registerActions(PI_SELECT_CARD, [
  "changed",
  "opened",
  "closed",
]);

export const onSelectChanged = createOnAction<PiSelectChangedEvent>(
  PI_SELECT_ACTION.CHANGED,
);

/** @deprecated Use `onSelectChanged` instead. */
export const onPiSelectChanged = onSelectChanged;

export const onSelectOpened = createOnAction<PiSelectOpenedEvent>(
  PI_SELECT_ACTION.OPENED,
);

/** @deprecated Use `onSelectOpened` instead. */
export const onPiSelectOpened = onSelectOpened;

export const onSelectClosed = createOnAction<PiSelectClosedEvent>(
  PI_SELECT_ACTION.CLOSED,
);

/** @deprecated Use `onSelectClosed` instead. */
export const onPiSelectClosed = onSelectClosed;

export type PiSelectOption = {
  /** The value stored in form state / dispatched in events. */
  value: string;
  /** Human-readable label shown in the dropdown. */
  label: string;
  /** When true, the option is shown but cannot be selected. */
  disabled?: boolean;
};

export type PiSelectProps = {
  /**
   * Field name used to bind to FormContext when inside a pi/form card.
   * When provided the component reads its selected value from form data and
   * writes back via form.handleChange.
   */
  name?: string;

  /**
   * Controlled value used in standalone mode (outside a Form).
   * Ignored when `name` is set and the component is inside a pi/form.
   */
  value?: string;

  /**
   * When true the component manages its own selected-value state internally.
   * Selecting an item will still dispatch the normal `onChanged` action, but
   * the UI will immediately reflect the new selection without waiting for the
   * host application to update `value` via a reducer.
   *
   * Has no effect when the component is bound to a pi/form via `name`.
   */
  selfManaged?: boolean;

  /**
   * Default (uncontrolled) value. Mirrors Radix `defaultValue`.
   */
  defaultValue?: string;

  /** Available options to display in the dropdown. */
  options: PiSelectOption[];

  /** Placeholder text shown when no option is selected. */
  placeholder?: string;

  /** When true, the select is required (HTML form attribute). */
  required?: boolean;

  /** When true, the select is disabled and non-interactive. */
  disabled?: boolean;

  /** Accessible label for screen readers. */
  ariaLabel?: string;
};

export type PiSelectChangedEvent = {
  /** Field name, mirrors the `name` prop if provided. */
  name?: string;
  /** The value of the newly selected option. */
  value: string;
};

export type PiSelectOpenedEvent = Record<string, never>;

export type PiSelectClosedEvent = Record<string, never>;

export type PiSelectEvents = {
  onChanged: PiSelectChangedEvent;
  onOpened: PiSelectOpenedEvent;
  onClosed: PiSelectClosedEvent;
};
