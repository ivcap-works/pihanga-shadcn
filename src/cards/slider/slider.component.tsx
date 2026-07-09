import React, {useEffect, useRef, useState} from "react";
import {type PiCardProps} from "@pihanga2/core";
import {Slider as SliderUI} from "@/components/ui/slider";
import {useFormContext} from "@/cards/form/form.context";
import {cn} from "@/lib/utils";
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
    showTicks = false,
    tickStep,
    majorTickStep,
    suppressTickLabels = false,
    tickLabels,
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

  // The "canonical" value from props / form / self-managed state.
  const canonicalValue = useFormData
    ? ((form.formData[name!] as number | undefined) ?? min)
    : selfManaged
      ? managedValue
      : (propValue ?? min);

  // Keep a ref to the latest canonical value so event handlers always see
  // the most up-to-date external value even if it changed during a drag.
  const canonicalValueRef = useRef(canonicalValue);
  canonicalValueRef.current = canonicalValue;

  // "Interactive" drag state — tracks knob position independently while the
  // user is actively dragging so we don't need an external value round-trip.
  const isDragging = useRef(false);
  const [interactiveValue, setInteractiveValue] =
    useState<number>(canonicalValue);

  // While dragging the knob follows pointer; otherwise it reflects the canonical value.
  const displayValue = isDragging.current ? interactiveValue : canonicalValue;

  // Refs for debounce: timer handle + latest pending value.
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValue = useRef<number>(canonicalValue);

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

  // Called on pointer/touch down — enter interactive mode so the knob can
  // move freely without waiting for an external state update.
  function handlePointerDown() {
    isDragging.current = true;
    setInteractiveValue(canonicalValueRef.current);
  }

  function handleValueChange(newValues: number[]) {
    const newValue = newValues[0] ?? min;

    // Guard: only update interactive display when actively dragging.
    if (!isDragging.current) return;

    setInteractiveValue(newValue);

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

    // Leave interactive mode — on next render displayValue reverts to canonicalValue,
    // snapping the knob back to whatever the external state currently says.
    isDragging.current = false;
    setInteractiveValue(canonicalValueRef.current);

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

  // --- Tick calculations ---
  // tickStep=0  → hide minor ticks only  (major still shown if majorTickStep > 0)
  // majorTickStep=0 → hide major ticks only (minor still shown if tickStep > 0)
  // Both 0 → nothing shown
  const effectiveMinorStep = tickStep !== undefined ? tickStep : step;
  const showMinorTicks = effectiveMinorStep > 0;

  // Auto major step: use minor step as base when minor ticks are on;
  // fall back to `step` when minor ticks are off (tickStep=0) so that
  // major ticks can still be auto-calculated from the slider's step.
  const autoMajorBase = showMinorTicks ? effectiveMinorStep : step;
  const autoMajorStep =
    autoMajorBase > 0
      ? Math.max(
          autoMajorBase,
          Math.round((max - min) / 5 / autoMajorBase) * autoMajorBase,
        )
      : 0;
  // majorTickStep undefined → auto; 0 → no major ticks; >0 → explicit value
  const resolvedMajorStep =
    majorTickStep !== undefined ? majorTickStep : autoMajorStep;
  const showMajorTicks = resolvedMajorStep > 0;

  const renderTicks = showTicks && (showMinorTicks || showMajorTicks);

  // Use minor spacing as base when available; fall back to major spacing.
  const baseStep = showMinorTicks ? effectiveMinorStep : resolvedMajorStep;
  const ticks = renderTicks
    ? Array.from(
        {length: Math.round((max - min) / baseStep) + 1},
        (_, i) => min + i * baseStep,
      )
    : [];

  return (
    <div
      data-pihanga={cardName}
      className={cn("flex flex-col gap-2", className)}
    >
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium leading-none">{label}</span>
          <span className="text-sm text-muted-foreground tabular-nums">
            {displayValue}
          </span>
        </div>
      )}
      <SliderUI
        value={[displayValue]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        className="w-full"
      />
      {renderTicks && (
        <div
          aria-hidden="true"
          className="flex w-full items-baseline justify-between px-0.5"
        >
          {ticks.map((tick) => {
            const isMajor =
              showMajorTicks && (tick - min) % resolvedMajorStep === 0;
            const isActive = tick <= displayValue;
            // Show label when:
            //  • suppressTickLabels is false, AND
            //  • tick is major  OR  there are no major ticks (label every minor tick)
            const showLabel =
              !suppressTickLabels && (isMajor || !showMajorTicks);
            const labelText = showLabel
              ? tickLabels && tick in tickLabels
                ? tickLabels[tick]
                : String(tick)
              : "";

            return (
              <div key={tick} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-0.5 rounded-full transition-all duration-300",
                    isActive ? "bg-primary" : "bg-primary/20",
                    isMajor ? "h-3" : "h-1.5",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    showLabel
                      ? "text-muted-foreground opacity-100"
                      : "opacity-0",
                  )}
                >
                  {labelText}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
