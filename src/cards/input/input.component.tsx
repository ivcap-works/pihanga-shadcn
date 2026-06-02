import React from "react";
import {type PiCardProps} from "@pihanga2/core";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useFormContext} from "@/cards/form/form.context";
import type {PiInputEvents, PiInputProps} from "./input.types";

export const InputComponent = (
  props: PiCardProps<PiInputProps, PiInputEvents>,
): React.ReactNode => {
  const {
    name,
    value: propValue = "",
    type = "text",
    placeholder,
    disabled,
    label,
    description,
    className,
    cardName,
    onChanged,
    onCommitted,
  } = props;

  // `id` and `invalid` may be injected by a parent pi/field card via
  // Pihanga's extra-prop forwarding.  They are not in the official type so
  // we read them through an escape hatch.
  const injectedId = (props as {id?: string}).id;
  const invalid = Boolean((props as {invalid?: boolean}).invalid);

  // Detect if we are inside a pi/form card via React context.
  const form = useFormContext();
  const useFormData = form.isInForm && Boolean(name);

  // Local display state — lets the user type freely without triggering Redux
  // on every keystroke.  Only `onCommitted` (blur / Enter) writes back to
  // Redux, so callers that use `onCommitted` instead of `onChanged` avoid
  // per-keystroke panel rebuilds.
  const [localValue, setLocalValue] = React.useState<string>(
    type === "file" ? "" : propValue,
  );

  // Sync local value when the prop changes from outside (e.g. when a different
  // card is selected in the playground, resetting the controls panel).
  React.useEffect(() => {
    if (!useFormData && type !== "file") {
      setLocalValue(propValue);
    }
  }, [propValue, useFormData, type]);

  // Derive the effective value for the controlled <Input>:
  //   - inside a form → read from form.formData[name]
  //   - standalone   → use localValue (updated on every keystroke locally)
  //   - file inputs  → uncontrolled (no value binding)
  const inputValue =
    type === "file"
      ? undefined
      : useFormData
        ? ((form.formData[name!] as string | undefined) ?? "")
        : localValue;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue =
      type === "file" ? (e.target.files?.[0]?.name ?? "") : e.target.value;
    if (useFormData) {
      form.handleChange(name!, newValue);
    } else {
      setLocalValue(newValue);
      onChanged({name, value: newValue});
    }
  }

  // Fire onCommitted when the user leaves the field or presses Enter.
  function handleBlur() {
    if (!useFormData && type !== "file") {
      onCommitted({name, value: localValue});
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !useFormData && type !== "file") {
      onCommitted({name, value: localValue});
    }
  }

  // Use the id injected by pi/field (for label↔control linking); fall back
  // to a locally-generated id when used standalone.
  const selfId = `${cardName}-${name ?? "input"}`;
  const fieldId = injectedId ?? selfId;

  return (
    <div data-pihanga={cardName} className="grid w-full gap-1.5">
      {label && <Label htmlFor={fieldId}>{label}</Label>}
      <Input
        id={fieldId}
        type={type}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        aria-invalid={invalid || undefined}
        aria-describedby={description ? `${fieldId}-desc` : undefined}
      />
      {description && (
        <p id={`${fieldId}-desc`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};
