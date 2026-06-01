import React, {useState} from "react";
import {type PiCardProps} from "@pihanga2/core";
import {
  Select as RadixSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {useFormContext} from "@/cards/form/form.context";
import type {PiSelectEvents, PiSelectProps} from "./select.types";

export const SelectComponent = (
  props: PiCardProps<PiSelectProps, PiSelectEvents>,
): React.ReactNode => {
  const {
    name,
    value: propValue = "",
    defaultValue,
    selfManaged = false,
    options,
    placeholder,
    required,
    disabled,
    ariaLabel,
    cardName,
    onChanged,
    onOpened,
    onClosed,
  } = props;

  // `id` and `invalid` may be injected by a parent pi/field card via
  // Pihanga's extra-prop forwarding.  They are not in the official type so
  // we read them through an escape hatch.
  const injectedId = (props as {id?: string}).id;
  const invalid = Boolean((props as {invalid?: boolean}).invalid);

  // Detect if we are inside a pi/form card via React context.
  const form = useFormContext();
  const useFormData = form.isInForm && Boolean(name);

  // Internal state used only when selfManaged=true and not bound to a form.
  const [managedValue, setManagedValue] = useState<string>(
    defaultValue ?? propValue,
  );

  const value = useFormData
    ? ((form.formData[name!] as string | undefined) ?? "")
    : selfManaged
      ? managedValue
      : propValue;

  function handleChange(newValue: string) {
    if (useFormData) {
      form.handleChange(name!, newValue);
    } else {
      if (selfManaged) {
        setManagedValue(newValue);
      }
      onChanged({name, value: newValue});
    }
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      onOpened({});
    } else {
      onClosed({});
    }
  }

  // Use the id injected by pi/field; fall back to a local id when standalone.
  const selfId = `${cardName}-${name ?? "select"}`;
  const fieldId = injectedId ?? selfId;

  return (
    <RadixSelect
      value={value}
      defaultValue={defaultValue}
      onValueChange={handleChange}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      required={required}
      aria-label={ariaLabel}
    >
      <SelectTrigger
        id={fieldId}
        aria-invalid={invalid || undefined}
        data-pihanga={cardName}
      >
        <SelectValue placeholder={placeholder ?? "Select…"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </RadixSelect>
  );
};
