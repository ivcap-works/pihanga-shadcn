import React, {useContext} from "react";

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
  isInForm: boolean;
}

const FALLBACK_CONTEXT: FormContextValue = {
  formData: {},
  errors: {},
  handleChange: () => {},
  setError: () => {},
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
