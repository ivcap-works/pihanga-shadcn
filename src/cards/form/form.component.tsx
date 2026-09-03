import React, {useState, useCallback, useRef, useEffect} from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {cn} from "@/lib/utils";
import {FormContext, type FormContextValue} from "./form.context";
import type {FormAction, PiFormEvents, PiFormProps} from "./form.types";

export const FormComponent = (
  props: PiCardProps<PiFormProps, PiFormEvents>,
): React.ReactNode => {
  const {
    id,
    content = [],
    initialValues = {},
    submitLabel = "Submit",
    hideSubmit = false,
    className,
    cardName,
    onSubmitted,
    onCancelled,
    onAbandoned,
  } = props;

  const [formData, setFormData] = useState<Record<string, unknown>>(() => ({
    ...initialValues,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tracks whether the form reached a "final" state (submitted or
  // explicitly cancelled) so the unmount effect below can tell the
  // difference between that and being torn down some other way (e.g. its
  // parent pi/dialog was dismissed) — the latter fires `onAbandoned`.
  const finalizedRef = useRef(false);
  // Mirrors state in refs so the unmount effect (which only runs once) can
  // read the latest values without re-subscribing on every keystroke.
  const idRef = useRef(id);
  idRef.current = id;
  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const onAbandonedRef = useRef(onAbandoned);
  onAbandonedRef.current = onAbandoned;

  useEffect(() => {
    return () => {
      if (!finalizedRef.current) {
        onAbandonedRef.current({id: idRef.current, formData: formDataRef.current});
      }
    };
    // Intentionally run only on mount/unmount.
     
  }, []);

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

  const doSubmit = useCallback(() => {
    finalizedRef.current = true;
    onSubmitted({id, formData});
  }, [id, formData, onSubmitted]);

  const doCancel = useCallback(() => {
    finalizedRef.current = true;
    onCancelled({id, formData});
  }, [id, formData, onCancelled]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      doSubmit();
    },
    [doSubmit],
  );

  // Single entry point for any control nested in the form's content to
  // trigger a top-level form action (Button's `formAction`, a field's
  // `submitOnEnter`, etc.) — keeps all form-bindable controls consistent.
  const requestAction = useCallback(
    (action: FormAction) => {
      if (action === "submit") {
        doSubmit();
      } else {
        doCancel();
      }
    },
    [doSubmit, doCancel],
  );

  const contextValue: FormContextValue = {
    formData,
    errors,
    handleChange,
    setError,
    requestAction,
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
        {!hideSubmit && (
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {submitLabel}
          </button>
        )}
      </form>
    </FormContext.Provider>
  );
};
