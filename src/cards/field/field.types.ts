import {createCardDeclaration, PiCardRef} from "@pihanga2/core";

export const PI_FIELD_CARD = "pi/field";

export const Field = createCardDeclaration<PiFieldProps>(PI_FIELD_CARD);

export type PiFieldProps = {
  /** Visible label rendered above the control. */
  label: string;

  /**
   * The Pihanga card reference for the plain control to render
   * (e.g. pi/text-field, pi/select, pi/checkbox, …).
   *
   * The field card will forward an `id` prop and an `invalid` boolean to the
   * inner card via Pihanga's standard prop-passing mechanism so the control
   * can wire up accessibility attributes without needing its own label logic.
   */
  fieldCard: PiCardRef;

  /**
   * Field name — when provided the card reads the current error from
   * FormContext (when inside a pi/form) to decide whether to show an error.
   */
  name?: string;

  /** Secondary help text rendered below the control. */
  description?: string;

  /**
   * Static error message.  Overridden by the form-context error when `name`
   * is provided and the card is inside a pi/form.
   */
  error?: string;

  /** Additional CSS classes applied to the outer Field wrapper. */
  className?: string;
};
