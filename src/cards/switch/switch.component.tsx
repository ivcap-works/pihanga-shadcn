import React from "react";
import {type PiCardProps} from "@pihanga2/core";
import {Switch as SwitchUI} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {useFormContext} from "@/cards/form/form.context";
import type {PiSwitchEvents, PiSwitchProps} from "./switch.types";

export const SwitchComponent = (
  props: PiCardProps<PiSwitchProps, PiSwitchEvents>,
): React.ReactNode => {
  const {
    name,
    checked: propChecked = false,
    disabled,
    label,
    className,
    cardName,
    onChanged,
  } = props;

  // `id` and `invalid` may be injected by a parent pi/field card via
  // Pihanga's extra-prop forwarding.  They are not in the official type so
  // we read them through an escape hatch.
  const injectedId = (props as {id?: string}).id;

  // Detect if we are inside a pi/form card via React context.
  const form = useFormContext();
  const useFormData = form.isInForm && Boolean(name);

  const checked = useFormData
    ? Boolean(form.formData[name!] ?? false)
    : propChecked;

  function handleCheckedChange(newChecked: boolean) {
    if (useFormData) {
      form.handleChange(name!, newChecked);
    } else {
      onChanged({name, checked: newChecked});
    }
  }

  // Use the id injected by pi/field; fall back to a local id when standalone.
  const selfId = `${cardName}-${name ?? "switch"}`;
  const fieldId = injectedId ?? selfId;

  return (
    <div
      data-pihanga={cardName}
      className={`flex items-center gap-2 ${className ?? ""}`}
    >
      <SwitchUI
        id={fieldId}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
      />
      {label && (
        <Label htmlFor={fieldId} className="cursor-pointer select-none">
          {label}
        </Label>
      )}
    </div>
  );
};
