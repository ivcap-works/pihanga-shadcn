import {
  createCardDeclaration,
  createOnAction,
  type PiCardRef,
  registerActions,
} from "@pihanga2/core";

export const PI_FORM_CARD = "pi/form";

export const Form = createCardDeclaration<PiFormProps, PiFormEvents>(
  PI_FORM_CARD,
);

export const PI_FORM_ACTION = registerActions(PI_FORM_CARD, [
  "submitted",
  "cancelled",
  "abandoned",
]);

export const onFormSubmitted = createOnAction<PiFormSubmittedEvent>(
  PI_FORM_ACTION.SUBMITTED,
);

/** @deprecated Use `onFormSubmitted` instead. */
export const onPiFormSubmitted = onFormSubmitted;

/**
 * Fires when a control inside the form's content explicitly requests
 * cancellation — see `FormContext.requestAction("cancel")` (wired up
 * automatically for any `Button` card with `formAction: "cancel"`).
 * Does not submit the form and does not reset its field values.
 */
export const onFormCancelled = createOnAction<PiFormCancelledEvent>(
  PI_FORM_ACTION.CANCELLED,
);

/**
 * Fires automatically when the Form card is removed from the screen
 * (unmounted) *without* having been submitted or explicitly cancelled first
 * — e.g. a parent `pi/dialog` is dismissed via the X button, Escape, or an
 * outside click while the form is still open. Use this to clean up any
 * related state (drafts, optimistic UI, etc.) regardless of how the host
 * container went away.
 *
 * Never fires after `onSubmitted` or `onCancelled` for the same form
 * instance.
 */
export const onFormAbandoned = createOnAction<PiFormAbandonedEvent>(
  PI_FORM_ACTION.ABANDONED,
);

/**
 * Shared props for any card that binds a single value to a `pi/form`'s
 * state (text inputs, toggles, selects, etc.).
 *
 * All form-bindable field cards (`pi/input`, `pi/text-field`,
 * `pi/text-area`, `pi/switch`, `pi/checkbox`, `pi/toggle-group`,
 * `pi/select`, …) extend this so the binding contract stays identical
 * everywhere: set `name` to read/write the field via `FormContext` when
 * rendered inside a `pi/form`; omit it (or render outside a form) to fall
 * back to the card's own standalone `value`/`checked` prop + `onChanged`
 * event.
 */
export type FormFieldProps = {
  /**
   * Field name used to bind to FormContext when inside a pi/form card.
   * When provided the component reads its value from form state and writes
   * back via form.handleChange.
   */
  name?: string;
};

/**
 * Actions a control nested inside a `pi/form` can request via
 * `FormContext.requestAction()` — currently used by `Button`'s
 * `formAction` prop, and by form-bindable fields' `submitOnEnter` prop.
 *
 * - `"submit"` — triggers the form's real submit flow (same as pressing its
 *   native submit button), which fires `onSubmitted`.
 * - `"cancel"` — fires `onCancelled` without submitting or resetting the
 *   form.
 */
export type FormAction = "submit" | "cancel";

export type PiFormProps = {
  /**
   * Optional id passed through to events for identification.
   */
  id?: string;

  /**
   * Ordered list of field card refs to render inside the form.
   * Each card (e.g. TextField, Checkbox, FormSelect) will be rendered
   * in order and wrapped by a FormContext.Provider so they can read
   * and write shared form state.
   */
  content?: PiCardRef[];

  /**
   * Initial values for the form fields, keyed by field name.
   */
  initialValues?: Record<string, unknown>;

  /**
   * Label for the submit button.
   * @default "Submit"
   */
  submitLabel?: string;

  /**
   * Additional CSS classes for the <form> element.
   */
  className?: string;

  /**
   * When true, the default footer "Submit" button is not rendered.
   * Use this when the form's own content already provides a way to submit
   * (e.g. a `Button` with `formAction: "submit"`).
   * @default false
   */
  hideSubmit?: boolean;
};

export type PiFormSubmittedEvent = {
  id?: string;
  /** Snapshot of form state at the time of submission. */
  formData: Record<string, unknown>;
};

export type PiFormCancelledEvent = {
  id?: string;
  /** Snapshot of form state at the time of cancellation. */
  formData: Record<string, unknown>;
};

export type PiFormAbandonedEvent = {
  id?: string;
  /** Snapshot of form state at the time the form was removed. */
  formData: Record<string, unknown>;
};

export type PiFormEvents = {
  onSubmitted: PiFormSubmittedEvent;
  onCancelled: PiFormCancelledEvent;
  onAbandoned: PiFormAbandonedEvent;
};
