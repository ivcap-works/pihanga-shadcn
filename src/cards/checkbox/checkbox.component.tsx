import React from "react";
import {type PiCardProps} from "@pihanga2/core";
import {useFormContext} from "@/cards/form/form.context";
import type {PiCheckboxEvents, PiCheckboxProps} from "./checkbox.types";

export const CheckboxComponent = (
  props: PiCardProps<PiCheckboxProps, PiCheckboxEvents>,
): React.ReactNode => {
  const {
    name,
    checked: propChecked = false,
    disabled,
    label,
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

  const checked = useFormData
    ? Boolean(form.formData[name!] ?? false)
    : propChecked;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newChecked = e.target.checked;
    if (useFormData) {
      form.handleChange(name!, newChecked);
    } else {
      onChanged({name, checked: newChecked});
    }
  }

  // Use the id injected by pi/field; fall back to a local id when standalone.
  const selfId = `${cardName}-${name ?? "checkbox"}`;
  const fieldId = injectedId ?? selfId;

  return (
    <div data-pihanga={cardName} className="flex items-center gap-2">
      <input
        id={fieldId}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className="h-4 w-4 rounded border-input accent-primary disabled:cursor-not-allowed disabled:opacity-50"
      />
      {label && (
        <label
          htmlFor={fieldId}
          className="text-sm leading-none cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
    </div>
  );
};
