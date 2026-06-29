import React, {useEffect, useRef, useState} from "react";
import {type PiCardProps} from "@pihanga2/core";
import {Slider as SliderUI} from "@/components/ui/slider";
import {useFormContext} from "@/cards/form/form.context";
import type {PiSliderEvents, PiSliderProps} from "./slider.types";

export const SliderComponent = (
  props: PiCardProps<PiSliderProps, PiSliderEvents>,
): React.ReactNode => {
  const {
    name,
    value: propValue,
    defaultValue,
    selfManaged = false,
    min = 0,
    max = 100,
    step = 1,
    disabled,
    debounceMs = 0,
    suppressChangedEvents = false,
    label,
    className,
    cardName,
    onChanged,
    onCommitted,
  } = props;

  // Detect if we are inside a pi/form card via React context.
  const form = useFormContext();
  const useFormData = form.isInForm && Boolean(name);

  // Internal state used only when selfManaged=true and not bound to a form.
  const [managedValue, setManagedValue] = useState<number>(
    defaultValue ?? propValue ?? min,
  );

  const value = useFormData
    ? ((form.formData[name!] as number | undefined) ?? min)
    : selfManaged
      ? managedValue
      : (propValue ?? min);

  // Refs for debounce: timer handle + latest pending value.
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValue = useRef<number>(value);

  // Clean up any pending debounce timer on unmount.
  useEffect(() => {
    return () => {
      if (debounceTimer.current != null) clearTimeout(debounceTimer.current);
    };
  }, []);

  function dispatchChanged(newValue: number) {
    // Silently skip if the caller has opted out of continuous change events.
    if (suppressChangedEvents) return;

    if (useFormData) {
      form.handleChange(name!, newValue);
    } else {
      onChanged({name, value: newValue});
    }
  }

  function handleValueChange(newValues: number[]) {
    const newValue = newValues[0] ?? min;

    // Update internal state immediately so the thumb moves without lag.
    if (selfManaged && !useFormData) {
      setManagedValue(newValue);
    }

    if (debounceMs > 0) {
      // Record the latest value and (re)start the quiet-window timer.
      pendingValue.current = newValue;
      if (debounceTimer.current != null) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        debounceTimer.current = null;
        dispatchChanged(pendingValue.current);
      }, debounceMs);
    } else {
      dispatchChanged(newValue);
    }
  }

  function handleValueCommit(newValues: number[]) {
    const newValue = newValues[0] ?? min;

    // Cancel any pending debounced onChanged — the committed event supersedes it.
    if (debounceTimer.current != null) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    // When debounce is active (and not suppressed), flush the final value via
    // onChanged before the committed event so listeners always see both.
    if (debounceMs > 0 && !suppressChangedEvents) {
      dispatchChanged(newValue);
    }

    onCommitted({name, value: newValue});
  }

  return (
    <div
      data-pihanga={cardName}
      className={`flex flex-col gap-2 ${className ?? ""}`}
    >
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium leading-none">{label}</span>
          <span className="text-sm text-muted-foreground tabular-nums">
            {value}
          </span>
        </div>
      )}
      <SliderUI
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        className="w-full"
      />
    </div>
  );
};
