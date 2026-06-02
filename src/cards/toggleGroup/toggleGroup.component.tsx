import React from "react";
import {type PiCardProps} from "@pihanga2/core";
import {
  ToggleGroup as ToggleGroupUI,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {useFormContext} from "@/cards/form/form.context";
import type {
  PiToggleGroupEvents,
  PiToggleGroupProps,
} from "./toggleGroup.types";

export const ToggleGroupComponent = (
  props: PiCardProps<PiToggleGroupProps, PiToggleGroupEvents>,
): React.ReactNode => {
  const {
    name,
    items,
    type = "single",
    value: propValue,
    selfManaged = false,
    variant = "default",
    size = "default",
    spacing = 0,
    disabled,
    className,
    cardName,
    onChanged,
  } = props;

  // Detect if we are inside a pi/form card via React context.
  const form = useFormContext();
  const useFormData = form.isInForm && Boolean(name);

  // ---------------------------------------------------------------------------
  // Self-managed (internal) state — only active when selfManaged=true and we
  // are NOT inside a pi/form card.
  // ---------------------------------------------------------------------------
  const initialSelfValue: string | string[] =
    type === "multiple"
      ? Array.isArray(propValue)
        ? propValue
        : propValue != null
          ? [String(propValue)]
          : []
      : typeof propValue === "string"
        ? propValue
        : "";

  const [internalValue, setInternalValue] = React.useState<string | string[]>(
    initialSelfValue,
  );

  // ---------------------------------------------------------------------------
  // Derive the effective value from the appropriate source.
  //   1. Form context (highest priority)
  //   2. Self-managed internal state
  //   3. Externally controlled prop value
  // ---------------------------------------------------------------------------
  const formRawValue = useFormData ? form.formData[name!] : undefined;
  const value: string | string[] = useFormData
    ? type === "multiple"
      ? Array.isArray(formRawValue)
        ? (formRawValue as string[])
        : formRawValue != null
          ? [String(formRawValue)]
          : []
      : formRawValue != null
        ? String(formRawValue)
        : ""
    : selfManaged
      ? internalValue
      : (propValue ?? (type === "multiple" ? [] : ""));

  function handleSingleChange(newValue: string) {
    if (useFormData) {
      form.handleChange(name!, newValue);
    } else {
      if (selfManaged) {
        setInternalValue(newValue);
      }
      onChanged({name: name ?? cardName, value: newValue});
    }
  }

  function handleMultipleChange(newValue: string[]) {
    if (useFormData) {
      form.handleChange(name!, newValue);
    } else {
      if (selfManaged) {
        setInternalValue(newValue);
      }
      onChanged({name: name ?? cardName, value: newValue});
    }
  }

  // Render single-selection group
  if (type === "single") {
    return (
      <ToggleGroupUI
        data-pihanga={cardName}
        type="single"
        value={typeof value === "string" ? value : ""}
        onValueChange={handleSingleChange}
        variant={variant}
        size={size}
        spacing={spacing}
        disabled={disabled}
        className={className}
      >
        {items.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            disabled={item.disabled}
          >
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroupUI>
    );
  }

  // Render multiple-selection group
  return (
    <ToggleGroupUI
      data-pihanga={cardName}
      type="multiple"
      value={Array.isArray(value) ? value : value ? [value] : []}
      onValueChange={handleMultipleChange}
      variant={variant}
      size={size}
      spacing={spacing}
      disabled={disabled}
      className={className}
    >
      {items.map((item) => (
        <ToggleGroupItem
          key={item.value}
          value={item.value}
          disabled={item.disabled}
        >
          {item.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroupUI>
  );
};
