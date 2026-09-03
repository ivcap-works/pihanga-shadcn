import React, {useContext} from "react";
import type {FormAction} from "./form.types";

/**
 * Shape of the data provided by FormContext.
 * When inside a <Form> card, isInForm is true and all fields are populated.
 * When outside (fallback), isInForm is false.
 */
export interface FormContextValue {
  formData: Record<string, unknown>;
  errors: Record<string, string>;
  handleChange: (fieldName: string, value: unknown) => void;
  setError: (fieldName: string, error: string | null) => void;
  /**
   * Call from within form content to request that the enclosing Form
   * perform a top-level action:
   * - `"submit"` — same as pressing the form's native submit button; fires
   *   `onSubmitted`. Used by `Button` (`formAction: "submit"`) and by
   *   form-bindable fields' `submitOnEnter` prop.
   * - `"cancel"` — fires `onCancelled` without submitting or resetting the
   *   form's field values. Used by `Button` (`formAction: "cancel"`).
   */
  requestAction: (action: FormAction) => void;
  isInForm: boolean;
}

const FALLBACK_CONTEXT: FormContextValue = {
  formData: {},
  errors: {},
  handleChange: () => {},
  setError: () => {},
  requestAction: () => {},
  isInForm: false,
};

export const FormContext = React.createContext<FormContextValue | null>(null);

/**
 * Hook that reads the nearest FormContext.
 * Returns a fallback (isInForm=false) when called outside a <Form> card.
 *
 * Usage in field components:
 *   const form = useFormContext();
 *   const value = form.isInForm && name ? form.formData[name] ?? '' : propValue;
 */
export const useFormContext = (): FormContextValue => {
  const ctx = useContext(FormContext);
  return ctx ?? FALLBACK_CONTEXT;
};
