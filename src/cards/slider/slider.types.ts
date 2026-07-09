import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const PI_SLIDER_CARD = "shad/slider";

export const Slider = createCardDeclaration<PiSliderProps, PiSliderEvents>(
  PI_SLIDER_CARD,
);

export const PI_SLIDER_ACTION = registerActions(PI_SLIDER_CARD, [
  "changed",
  "committed",
]);

export const onSliderChanged = createOnAction<PiSliderChangedEvent>(
  PI_SLIDER_ACTION.CHANGED,
);

/** @deprecated Use `onSliderChanged` instead. */
export const onPiSliderChanged = onSliderChanged;

/**
 * Fired once when the user **finishes** dragging (mouse-up / touch-end).
 *
 * Use this instead of `onSliderChanged` when you only care about the final
 * settled value and do not want to process every intermediate drag position.
 */
export const onSliderCommitted = createOnAction<PiSliderCommittedEvent>(
  PI_SLIDER_ACTION.COMMITTED,
);

/** @deprecated Use `onSliderCommitted` instead. */
export const onPiSliderCommitted = onSliderCommitted;

// ---------------------------------------------------------------------------
// Props & Events
// ---------------------------------------------------------------------------

export type PiSliderProps = {
  /**
   * Field name used to bind to FormContext when inside a pi/form card.
   * When provided the component reads its value from form data and writes
   * back via form.handleChange.
   */
  name?: string;

  /**
   * Controlled numeric value (single thumb).
   * Ignored when `name` is set and the component is inside a pi/form,
   * and also ignored when `selfManaged` is true (use `defaultValue` instead).
   */
  value?: number;

  /**
   * Initial value used when `selfManaged` is true.
   * Falls back to `value` → `min` → 0 if not provided.
   */
  defaultValue?: number;

  /**
   * When true the slider keeps its own internal value state.
   * Dragging updates the displayed value immediately without needing an
   * external state update.  `onChanged` is still fired on every change so
   * the app can react (or log) without being responsible for feeding the
   * value back as a prop.
   *
   * Ignored when inside a pi/form (form state takes precedence).
   */
  selfManaged?: boolean;

  /** Minimum value of the slider range. Defaults to 0. */
  min?: number;

  /** Maximum value of the slider range. Defaults to 100. */
  max?: number;

  /** Stepping interval between selectable values. Defaults to 1. */
  step?: number;

  /** When true, the slider is disabled and non-interactive. */
  disabled?: boolean;

  /**
   * Debounce delay in milliseconds applied to `onChanged` during continuous
   * drag.  Only the last value within each quiet window is dispatched.
   *
   * Useful when the `onChanged` handler is expensive (e.g. triggers an API
   * call) — set e.g. `debounceMs: 200` to cap the event rate.
   *
   * Has no effect on `onCommitted`, which always fires exactly once at
   * drag-end regardless of this setting.
   *
   * Omit (or set to 0) to dispatch on every drag position (default behaviour).
   */
  debounceMs?: number;

  /**
   * When true, `onSliderChanged` is **never** dispatched during drag.
   *
   * Use this together with `onSliderCommitted` when you only care about
   * the final settled value and want to eliminate all intermediate Redux
   * actions entirely (stricter than `debounceMs`).
   *
   * `onSliderCommitted` is unaffected and always fires on release.
   * `selfManaged` visual updates are also unaffected.
   */
  suppressChangedEvents?: boolean;

  /**
   * Optional label text rendered above the slider.
   * When provided, the current numeric value is shown to the right of the label.
   */
  label?: string;

  /**
   * When true, tick marks are rendered below the slider track.
   */
  showTicks?: boolean;

  /**
   * Spacing between consecutive **minor** tick marks in value units.
   * Defaults to `step`.
   * Set to `0` to hide minor ticks only — major ticks are still shown
   * if `majorTickStep` is non-zero.
   */
  tickStep?: number;

  /**
   * Interval (in value units) between **major** (tall, labelled) ticks.
   * Defaults to `(max - min) / 5` rounded to the nearest `tickStep`.
   * Set to `0` to hide major ticks only — minor ticks are still shown
   * if `tickStep` is non-zero.
   */
  majorTickStep?: number;

  /**
   * When true, no tick labels are rendered at all (only the tick marks).
   * Overrides `tickLabels` and the default numeric labels.
   */
  suppressTickLabels?: boolean;

  /**
   * Custom labels keyed by value.  When provided for a value, the custom
   * string is shown instead of the numeric value.  Pass `""` to suppress the
   * label for a specific tick.
   *
   * @example { 0: "Min", 50: "Mid", 100: "Max" }
   */
  tickLabels?: Record<number, string>;

  /** Extra Tailwind / CSS classes forwarded to the root wrapper element. */
  className?: string;
};

export type PiSliderChangedEvent = {
  /** Field name, mirrors the `name` prop if provided. */
  name?: string;
  /** New numeric value after the change. */
  value: number;
};

export type PiSliderCommittedEvent = {
  /** Field name, mirrors the `name` prop if provided. */
  name?: string;
  /** Final settled value when the user released the thumb. */
  value: number;
};

export type PiSliderEvents = {
  onChanged: PiSliderChangedEvent;
  onCommitted: PiSliderCommittedEvent;
};
