import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const PI_TOGGLE_GROUP_CARD = "pi/toggle-group";

export const ToggleGroup = createCardDeclaration<
  PiToggleGroupProps,
  PiToggleGroupEvents
>(PI_TOGGLE_GROUP_CARD);

export const PI_TOGGLE_GROUP_ACTION = registerActions(PI_TOGGLE_GROUP_CARD, [
  "changed",
]);

export const onToggleGroupChanged = createOnAction<PiToggleGroupChangedEvent>(
  PI_TOGGLE_GROUP_ACTION.CHANGED,
);

/** @deprecated Use `onToggleGroupChanged` instead. */
export const onPiToggleGroupChanged = onToggleGroupChanged;

// ---------------------------------------------------------------------------
// Item type
// ---------------------------------------------------------------------------

export type PiToggleGroupItem = {
  /** The value associated with this toggle item. */
  value: string;
  /** Human-readable label rendered inside the toggle button. */
  label: string;
  /** When true, this individual item is disabled. */
  disabled?: boolean;
};

// ---------------------------------------------------------------------------
// Props & Events
// ---------------------------------------------------------------------------

export type PiToggleGroupProps = {
  /**
   * Field name used to bind to FormContext when inside a pi/form card.
   * When provided the component reads its selected value from form data and
   * writes back via form.handleChange.
   */
  name?: string;

  /**
   * The list of toggle items to display.
   */
  items: PiToggleGroupItem[];

  /**
   * Selection mode.
   * - `"single"` — at most one item can be active at a time.
   * - `"multiple"` — any number of items can be active simultaneously.
   *
   * @default "single"
   */
  type?: "single" | "multiple";

  /**
   * Controlled selected value(s).
   * - In `"single"` mode: a `string` (or `undefined` for nothing selected).
   * - In `"multiple"` mode: an array of `string`.
   *
   * Ignored when `name` is set and the component is inside a pi/form.
   * Also ignored when `selfManaged` is `true`.
   */
  value?: string | string[];

  /**
   * When `true`, the component manages its own selection state internally
   * using `React.useState`.  The `value` prop is used only as the initial
   * value (i.e. `defaultValue`) and subsequent changes do not require an
   * external state update.  `onChanged` is still fired so callers can
   * observe changes without owning the state.
   *
   * Has no effect when inside a pi/form (form context always takes
   * precedence).
   *
   * @default false
   */
  selfManaged?: boolean;

  /**
   * Visual style variant of the toggle buttons.
   * - `"default"` — transparent background, highlights on active.
   * - `"outline"` — bordered buttons, grouped or spaced.
   *
   * @default "default"
   */
  variant?: "default" | "outline";

  /**
   * Size of each toggle button.
   * @default "default"
   */
  size?: "default" | "sm" | "lg";

  /**
   * Gap between toggle buttons (in Tailwind spacing units).
   * `0` = buttons are joined (no gap, rounded ends only).
   * Positive values add space between each button.
   *
   * @default 0
   */
  spacing?: number;

  /** When true, the entire group is disabled and non-interactive. */
  disabled?: boolean;

  /** Extra Tailwind / CSS classes forwarded to the root element. */
  className?: string;
};

export type PiToggleGroupChangedEvent = {
  /** Field name, mirrors the `name` prop if provided. */
  name?: string;
  /**
   * New selected value(s).
   * - In `"single"` mode: a `string` (empty string when nothing selected).
   * - In `"multiple"` mode: an array of `string`.
   */
  value: string | string[];
};

export type PiToggleGroupEvents = {
  onChanged: PiToggleGroupChangedEvent;
};
