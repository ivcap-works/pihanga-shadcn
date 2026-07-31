import React from "react";
import {type PiCardProps} from "@pihanga2/core";
import {Input} from "@/components/ui/input";
import {useFormContext} from "@/cards/form/form.context";
import type {PiTextFieldEvents, PiTextFieldProps} from "./textField.types";

export const TextFieldComponent = (
  props: PiCardProps<PiTextFieldProps, PiTextFieldEvents>,
): React.ReactNode => {
  const {
    name,
    value: propValue = "",
    type = "text",
    placeholder,
    disabled,
    cardName,
    onChanged,
  } = props;

  // `id` and `invalid` may be injected by a parent pi/field card via
  // Pihanga's extra-prop forwarding.  They are not in the official type so
  // we read them through an escape hatch.
  const injectedId = (props as {id?: string}).id;
  const invalid = Boolean((props as {invalid?: boolean}).invalid);

  // Detect if we are inside a pi/form card via React context.
  const form = useFormContext();
  const useFormData = form.isInForm && Boolean(name);

  const value = useFormData
    ? ((form.formData[name!] as string | undefined) ?? "")
    : propValue;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    if (useFormData) {
      form.handleChange(name!, newValue);
    } else {
      onChanged({name, value: newValue});
    }
  }

  // Use the id injected by pi/field (for label↔control linking); fall back
  // to a locally-generated id when used standalone.
  const selfId = `${cardName}-${name ?? "field"}`;
  const fieldId = injectedId ?? selfId;

  return (
    <Input
      id={fieldId}
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      data-pihanga={cardName}
    />
  );
};
