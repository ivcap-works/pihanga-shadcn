import React, {useMemo} from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {cn} from "@/lib/utils";
import {useFormContext} from "@/cards/form/form.context";
import type {PiFieldProps} from "./field.types";

export const FieldCardComponent = (
  props: PiCardProps<PiFieldProps>,
): React.ReactNode => {
  const {
    label,
    fieldCard,
    name,
    description,
    error: propError,
    className,
    cardName,
  } = props;

  // When name is provided and we're inside a pi/form, use the form error.
  const form = useFormContext();
  const error = form.isInForm && name ? form.errors[name] : propError;

  // Stable id that links <FieldLabel htmlFor> to the inner control's id.
  const fieldId = React.useId();

  // Memoize the extra props forwarded to the inner card so that Pihanga does
  // not see a brand-new object on every render (which would cause it to treat
  // the inner card as a new/changed card and unmount/remount it).
  const isInvalid = Boolean(error);
  /*
      Pihanga's Card forwards every prop other than cardName / parentCard to
      the bound component.  We inject `id` (so the control's element gets
      the id that FieldLabel points at) and `invalid` (so the control can
      set aria-invalid without needing its own error/label logic).
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldCardProps = useMemo<any>(
    () => ({
      cardName: fieldCard,
      parentCard: cardName,
      id: fieldId,
      invalid: isInvalid,
    }),
    [cardName, fieldCard, fieldId, isInvalid],
  );

  return (
    <Field
      data-invalid={Boolean(error) || undefined}
      className={cn(className)}
      data-pihanga={cardName}
    >
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>

      <Card {...fieldCardProps} />

      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  );
};
