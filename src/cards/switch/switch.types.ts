import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const PI_SWITCH_CARD = "pi/switch";

export const Switch = createCardDeclaration<PiSwitchProps, PiSwitchEvents>(
  PI_SWITCH_CARD,
);

export const PI_SWITCH_ACTION = registerActions(PI_SWITCH_CARD, ["changed"]);

export const onSwitchChanged = createOnAction<PiSwitchChangedEvent>(
  PI_SWITCH_ACTION.CHANGED,
);

/** @deprecated Use `onSwitchChanged` instead. */
export const onPiSwitchChanged = onSwitchChanged;

// ---------------------------------------------------------------------------
// Props & Events
// ---------------------------------------------------------------------------

export type PiSwitchProps = {
  /**
   * Field name used to bind to FormContext when inside a pi/form card.
   * When provided the component reads its checked state from form data and
   * writes back via form.handleChange.
   */
  name?: string;

  /**
   * Controlled checked state used in standalone mode (outside a Form).
   * Ignored when `name` is set and the component is inside a pi/form.
   */
  checked?: boolean;

  /** When true, the switch is disabled and non-interactive. */
  disabled?: boolean;

  /**
   * Optional label text rendered beside the switch.
   * The label is automatically associated with the switch via `htmlFor`.
   */
  label?: string;

  /** Extra Tailwind / CSS classes forwarded to the root wrapper element. */
  className?: string;
};

export type PiSwitchChangedEvent = {
  /** Field name, mirrors the `name` prop if provided. */
  name?: string;
  /** New checked state after the toggle. */
  checked: boolean;
};

export type PiSwitchEvents = {
  onChanged: PiSwitchChangedEvent;
};
