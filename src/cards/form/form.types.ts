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

export const PI_FORM_ACTION = registerActions(PI_FORM_CARD, ["submitted"]);

export const onFormSubmitted = createOnAction<PiFormSubmittedEvent>(
  PI_FORM_ACTION.SUBMITTED,
);

/** @deprecated Use `onFormSubmitted` instead. */
export const onPiFormSubmitted = onFormSubmitted;

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
};

export type PiFormSubmittedEvent = {
  id?: string;
  /** Snapshot of form state at the time of submission. */
  formData: Record<string, unknown>;
};

export type PiFormEvents = {
  onSubmitted: PiFormSubmittedEvent;
};
