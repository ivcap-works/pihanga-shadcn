import React from "react";
import {type PiCardProps} from "@pihanga2/core";
import {cn} from "@/components/lib/utils";
import type {PiSliderValueProps} from "./sliderValue.types";

/**
 * Display-only companion to `shad/slider`.
 *
 * Renders the same track + filled-range visual as the interactive slider but
 * with no thumb and no user interaction.  Use this card to show a read-only
 * numeric value in contexts where editing is not permitted (e.g. a summary
 * panel, a table cell, or a loading state).
 *
 * The component uses the same Tailwind classes as `src/components/ui/slider.tsx`
 * so the two cards look identical.
 */
export const SliderValueComponent = (
  props: PiCardProps<PiSliderValueProps>,
): React.ReactNode => {
  const {value, min = 0, max = 100, label, className, cardName} = props;

  // Clamp value inside [min, max] and compute fill percentage.
  const clamped = Math.min(Math.max(value, min), max);
  const range = max - min;
  const pct = range > 0 ? ((clamped - min) / range) * 100 : 0;

  return (
    <div
      data-pihanga={cardName}
      className={cn("flex flex-col gap-2", className)}
    >
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium leading-none">{label}</span>
          <span className="text-sm text-muted-foreground tabular-nums">
            {clamped}
          </span>
        </div>
      )}
      {/* Track — mirrors the SliderPrimitive.Track CSS from slider.tsx */}
      <div
        aria-hidden="true"
        className={cn(
          "bg-muted relative h-1.5 w-full grow overflow-hidden rounded-full",
        )}
      >
        {/* Range fill — mirrors SliderPrimitive.Range */}
        <div
          className="bg-primary absolute h-full transition-[width]"
          style={{width: `${pct}%`}}
        />
      </div>
    </div>
  );
};
