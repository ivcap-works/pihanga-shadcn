import React, {useState, useCallback} from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {cn} from "@/lib/utils";
import {FormContext, type FormContextValue} from "./form.context";
import type {PiFormEvents, PiFormProps} from "./form.types";

export const FormComponent = (
  props: PiCardProps<PiFormProps, PiFormEvents>,
): React.ReactNode => {
  const {
    id,
    content = [],
    initialValues = {},
    submitLabel = "Submit",
    className,
    cardName,
    onSubmitted,
  } = props;

  const [formData, setFormData] = useState<Record<string, unknown>>(() => ({
    ...initialValues,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((fieldName: string, value: unknown) => {
    setFormData((prev) => ({...prev, [fieldName]: value}));
    // Clear validation error when the user modifies the field
    setErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = {...prev};
      delete next[fieldName];
      return next;
    });
  }, []);

  const setError = useCallback((fieldName: string, error: string | null) => {
    setErrors((prev) => {
      if (error === null) {
        const next = {...prev};
        delete next[fieldName];
        return next;
      }
      return {...prev, [fieldName]: error};
    });
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmitted({id, formData});
    },
    [id, formData, onSubmitted],
  );

  const contextValue: FormContextValue = {
    formData,
    errors,
    handleChange,
    setError,
    isInForm: true,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        onSubmit={handleSubmit}
        className={cn("flex flex-col gap-4", className)}
        data-pihanga={cardName}
      >
        {content.map((cref, idx) => (
          <Card key={idx} cardName={cref} parentCard={cardName} />
        ))}
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </form>
    </FormContext.Provider>
  );
};
