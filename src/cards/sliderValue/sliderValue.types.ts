import {createCardDeclaration} from "@pihanga2/core";

export const PI_SLIDER_VALUE_CARD = "shad/slider-value";

export const SliderValue =
  createCardDeclaration<PiSliderValueProps>(PI_SLIDER_VALUE_CARD);

// ---------------------------------------------------------------------------
// Props (no events — display-only)
// ---------------------------------------------------------------------------

export type PiSliderValueProps = {
  /**
   * The numeric value to display on the track.
   * Clamped between `min` and `max`.
   */
  value: number;

  /** Minimum value of the range. Defaults to 0. */
  min?: number;

  /** Maximum value of the range. Defaults to 100. */
  max?: number;

  /**
   * Optional label text rendered above the track.
   * When provided, the numeric value is shown to the right of the label,
   * matching the interactive `shad/slider` layout exactly.
   */
  label?: string;

  /** Extra Tailwind / CSS classes forwarded to the root wrapper element. */
  className?: string;
};
