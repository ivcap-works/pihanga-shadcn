import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const PI_INPUT_CARD = "pi/input";

export const PiInput = createCardDeclaration<PiInputProps, PiInputEvents>(
  PI_INPUT_CARD,
);

export const PI_INPUT_ACTION = registerActions(PI_INPUT_CARD, [
  "changed",
  "committed",
]);

export const onPiInputChanged = createOnAction<PiInputChangedEvent>(
  PI_INPUT_ACTION.CHANGED,
);

/**
 * Subscribe to "committed" events — fired when the user finishes editing
 * (blur or Enter key).  Unlike `onChanged` (which fires on every keystroke),
 * `onCommitted` only fires once per editing session, making it the preferred
 * handler for controlled inputs that trigger expensive downstream work.
 */
export const onPiInputCommitted = createOnAction<PiInputCommittedEvent>(
  PI_INPUT_ACTION.COMMITTED,
);

// ---------------------------------------------------------------------------
// Props & Events
// ---------------------------------------------------------------------------

export type PiInputProps = {
  /**
   * Field name used to bind to FormContext when inside a pi/form card.
   * When provided the component reads its value from form state and writes
   * back via form.handleChange.
   */
  name?: string;

  /**
   * Controlled value used in standalone mode (outside a Form).
   * Ignored when `name` is set and the component is inside a pi/form.
   */
  value?: string;

  /**
   * HTML input type.
   * Common values: "text" | "email" | "password" | "number" | "search" |
   * "url" | "tel" | "date" | "file".
   * Defaults to "text".
   */
  type?: string;

  /** Placeholder text shown when the input is empty. */
  placeholder?: string;

  /** When true, the input is disabled and non-interactive. */
  disabled?: boolean;

  /**
   * Optional label text rendered in a `<label>` element above the input.
   * The label is automatically associated with the input via `htmlFor`.
   */
  label?: string;

  /**
   * Optional helper / description text rendered below the input.
   * Use this for hints, formatting guidance, or validation feedback.
   */
  description?: string;

  /** Extra Tailwind / CSS classes forwarded to the underlying <input> element. */
  className?: string;
};

export type PiInputChangedEvent = {
  /** Field name, mirrors the `name` prop if provided. */
  name?: string;
  /** New value after the change. */
  value: string;
};

/**
 * Payload for the `onCommitted` event (blur / Enter key).
 * Same shape as `PiInputChangedEvent`.
 */
export type PiInputCommittedEvent = {
  /** Field name, mirrors the `name` prop if provided. */
  name?: string;
  /** Final committed value. */
  value: string;
};

export type PiInputEvents = {
  /** Fires on every keystroke. */
  onChanged: PiInputChangedEvent;
  /**
   * Fires once when the user finishes editing (blur or Enter key).
   * Use this instead of `onChanged` when each change triggers expensive
   * downstream work (e.g. rebuilding a panel).
   */
  onCommitted: PiInputCommittedEvent;
};
