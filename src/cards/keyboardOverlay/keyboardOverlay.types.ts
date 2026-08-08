import {
  type PiCardRef,
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const KEYBOARD_OVERLAY_CARD = "keyboard-overlay";

export const KeyboardOverlay = createCardDeclaration<
  KeyboardOverlayProps,
  KeyboardOverlayEvents
>(KEYBOARD_OVERLAY_CARD);

export const KEYBOARD_OVERLAY_ACTION = registerActions(KEYBOARD_OVERLAY_CARD, [
  "shortcut",
]);

export const onKeyboardShortcut = createOnAction<KeyboardOverlayShortcutEvent>(
  KEYBOARD_OVERLAY_ACTION.SHORTCUT,
);

/** Modifier keys that can be part of a shortcut definition. */
export type Modifier = "ctrl" | "shift" | "alt" | "meta";

/**
 * A single keyboard shortcut to intercept.
 *
 * `key` matches `KeyboardEvent.key` (e.g. `"k"`, `"Escape"`, `"ArrowUp"`) or
 * `KeyboardEvent.code` (e.g. `"KeyK"`).
 *
 * `modifiers` lists the modifier keys that **must** be active; any modifier
 * not listed is expected to be **inactive** (strict matching).
 *
 * `id` is an optional caller-defined label that is forwarded in the event so
 * you can distinguish shortcuts without pattern-matching on key+modifiers.
 *
 * `propagate` controls whether the key event continues down the DOM tree after
 * the overlay handles it.  Defaults to `false` (the event is consumed here).
 * Set to `true` to fire the pihanga event **and** still let the browser /
 * focused child element see the keystroke.
 */
export type ShortcutDef = {
  key: string;
  modifiers?: Modifier[];
  id?: string;
  /** When `true` the key event is NOT stopped — it propagates normally after
   *  the pihanga `onShortcut` event fires.  Default: `false`. */
  propagate?: boolean;
};

export type KeyboardOverlayProps = {
  /** Child card to render beneath the overlay. */
  content: PiCardRef;
  /** Shortcuts to intercept; all other key events pass through. */
  shortcuts: ShortcutDef[];
  /**
   * When `true` (default) the wrapper `<div>` is made focusable (`tabIndex -1`)
   * and automatically focused on mount, giving it the keyboard context so that
   * shortcuts are reliably delivered even inside iframes or when an outer element
   * would otherwise hold focus.
   *
   * Set to `false` only if you need focus to stay on a specific child element
   * (e.g. a text input) right from the start; the document-level capture listener
   * will still handle shortcuts, but without focus ownership.
   */
  captureFocus?: boolean;
  /**
   * When set, the overlay walks up the DOM from the cursor position looking for
   * `data-{dataKey}` instead of the default `data-pihanga` attribute.
   * The found value is forwarded as `dataValue` in the shortcut event.
   */
  dataKey?: string;
  /**
   * Extra CSS classes applied to the wrapper `<div>`.
   *
   * Useful for layout constraints, e.g. `"h-full w-full flex"`.
   * `position: relative` is always applied and cannot be overridden.
   */
  className?: string;
  /**
   * Inline styles merged onto the wrapper `<div>`.
   *
   * `position: relative` is always applied and takes precedence.
   */
  style?: React.CSSProperties;
};

/**
 * Payload emitted by `onShortcut` whenever a registered shortcut fires.
 *
 * `dataValue` is the value of the `data-{dataKey}` attribute (defaulting to
 * `data-pihanga`) of the **lowest** DOM element under the cursor at the moment
 * the key was pressed, walking up the tree until a match is found.
 * `undefined` when no matching ancestor exists.
 */
export type KeyboardOverlayShortcutEvent = {
  /** `ShortcutDef.id` when set, otherwise the matched `key`. */
  shortcutId: string;
  key: string;
  modifiers: Modifier[];
  dataValue?: string;
  cursorX: number;
  cursorY: number;
};

export type KeyboardOverlayEvents = {
  onShortcut: KeyboardOverlayShortcutEvent;
};
