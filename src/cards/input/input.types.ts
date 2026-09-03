import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";
import type {FormFieldProps} from "@/cards/form/form.types";

export const PI_INPUT_CARD = "pi/input";

export const Input = createCardDeclaration<PiInputProps, PiInputEvents>(
  PI_INPUT_CARD,
);

/** @deprecated Use `Input` instead. */
export const PiInput = Input;

export const PI_INPUT_ACTION = registerActions(PI_INPUT_CARD, [
  "changed",
  "committed",
]);

export const onInputChanged = createOnAction<PiInputChangedEvent>(
  PI_INPUT_ACTION.CHANGED,
);

/** @deprecated Use `onInputChanged` instead. */
export const onPiInputChanged = onInputChanged;

/**
 * Subscribe to "committed" events — fired when the user finishes editing
 * (blur or Enter key).  Unlike `onInputChanged` (which fires on every keystroke),
 * `onInputCommitted` only fires once per editing session, making it the preferred
 * handler for controlled inputs that trigger expensive downstream work.
 */
export const onInputCommitted = createOnAction<PiInputCommittedEvent>(
  PI_INPUT_ACTION.COMMITTED,
);

/** @deprecated Use `onInputCommitted` instead. */
export const onPiInputCommitted = onInputCommitted;

// ---------------------------------------------------------------------------
// Props & Events
// ---------------------------------------------------------------------------

export type PiInputProps = FormFieldProps & {
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

  /**
   * When true, the input grabs keyboard focus the first time it is
   * mounted/shown (e.g. when a dialog or drawer opens). Only applies once,
   * on mount — it does not re-focus on subsequent re-renders.
   */
  autoFocus?: boolean;

  /**
   * When true and this input is rendered inside a `pi/form` card, pressing
   * Enter requests the form's submit action (`FormContext.requestAction("submit")`)
   * — equivalent to clicking a `Button` with `formAction: "submit"` — instead
   * of (or in addition to) firing `onCommitted`.
   *
   * Has no effect outside a `pi/form`.
   * @default false
   */
  submitOnEnter?: boolean;
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
