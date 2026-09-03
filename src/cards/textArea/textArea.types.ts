import type {CSSProperties} from "react";
import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";
import type {FormFieldProps} from "@/cards/form/form.types";

export const PI_TEXT_AREA_CARD = "pi/text-area";

export const TextArea = createCardDeclaration<
  PiTextAreaProps,
  PiTextAreaEvents
>(PI_TEXT_AREA_CARD);

export const PI_TEXT_AREA_ACTION = registerActions(PI_TEXT_AREA_CARD, [
  "changed",
  "submitted",
]);

export const onTextAreaChanged = createOnAction<PiTextAreaChangedEvent>(
  PI_TEXT_AREA_ACTION.CHANGED,
);

export const onTextAreaSubmitted = createOnAction<PiTextAreaSubmittedEvent>(
  PI_TEXT_AREA_ACTION.SUBMITTED,
);

/** A CSS length. Numbers are treated as pixels, strings are used verbatim. */
export type CssLength = number | string;

/**
 * How the textarea sizes itself:
 *  - "fixed"   (default) — plain `<textarea>` behaviour. Size is governed by
 *              `rows`/`cols` (and any explicit `width`/`height`); the user
 *              may resize it per the `resize` prop. Never grows with content.
 *  - "content" — uses the CSS `field-sizing: content` behaviour: the box
 *              grows/shrinks to fit its content, clamped by any
 *              `minHeight`/`maxHeight`/`width`/`height`/`maxWidth` you set.
 *              `rows`/`cols` are ignored by the browser once this is active.
 */
export type PiTextAreaFieldSizing = "fixed" | "content";

export type PiTextAreaResize = "none" | "vertical" | "horizontal" | "both";

export type PiTextAreaProps = FormFieldProps & {
  /**
   * Controlled value used in standalone mode (outside a Form).
   * Ignored when `name` is set and the component is inside a pi/form.
   */
  value?: string;

  /** Placeholder text shown when the box is empty. May contain `\n`. */
  placeholder?: string;

  /** When true, the textarea is disabled and non-interactive. */
  disabled?: boolean;

  /** When true, the textarea's value cannot be edited by the user. */
  readOnly?: boolean;

  /**
   * Number of visible text lines. Only meaningful when `fieldSizing` is
   * `"fixed"` — browsers ignore `rows`/`cols` once `field-sizing: content`
   * is active. Default: `4`.
   */
  rows?: number;

  /** Number of visible character columns. See `rows` for caveats. */
  cols?: number;

  /** See `PiTextAreaFieldSizing`. Default: `"fixed"`. */
  fieldSizing?: PiTextAreaFieldSizing;

  /**
   * CSS `resize` behaviour — whether/how the user can drag-resize the box.
   * Default: `"vertical"` when `fieldSizing` is `"fixed"`, `"none"` when
   * `fieldSizing` is `"content"` (dragging would otherwise permanently
   * defeat the content-based sizing by writing an inline width/height).
   */
  resize?: PiTextAreaResize;

  /** Minimum height. Accepts CSS units like `"2lh"`, `"4rem"`, or a number of px. */
  minHeight?: CssLength;

  /** Maximum height. Once reached, content scrolls instead of growing further. */
  maxHeight?: CssLength;

  /** Explicit width. Freezes the inline axis even when `fieldSizing="content"`. */
  width?: CssLength;

  /** Explicit height. Freezes the block axis even when `fieldSizing="content"`. */
  height?: CssLength;

  /**
   * Maximum width — a guard against an unconstrained `fieldSizing="content"`
   * box escaping its parent container.
   */
  maxWidth?: CssLength;

  /** Text direction. Default: inherited from the document. */
  dir?: "ltr" | "rtl";

  /**
   * CSS `writing-mode`. With `"vertical-rl"` the sizing axes swap: content
   * growth under `fieldSizing="content"` runs horizontally, not vertically.
   */
  writingMode?: "horizontal-tb" | "vertical-rl" | "vertical-lr";

  /**
   * When true, pressing Enter (without Shift/Ctrl/Meta/Alt) submits instead
   * of inserting a newline. Shift+Enter (etc.) still inserts a newline.
   *
   * - Inside a `pi/form` (i.e. `name` is set and a `pi/form` ancestor is
   *   present): requests the form's submit action
   *   (`FormContext.requestAction("submit")`) — equivalent to clicking a
   *   `Button` with `formAction: "submit"`, and consistent with
   *   `pi/input`'s / `pi/text-field`'s `submitOnEnter`.
   * - Standalone: fires this card's own `onSubmitted` event with the
   *   current text.
   *
   * Default: `false`.
   */
  submitOnEnter?: boolean;

  /**
   * **Standalone mode only** (ignored when used inside a `pi/form` card —
   * see below). When true, the textarea keeps its own internal text state
   * so the visible text always updates immediately as the user types, but
   * the outgoing `onChanged` event is only dispatched at a "commit" point
   * instead of on every keystroke:
   *
   *  - always on blur,
   *  - and, if `debounceMs > 0`, also after that many ms of typing
   *    inactivity (a trailing debounce), so the value is committed even if
   *    the user never blurs the field (e.g. drives an autosave / API call).
   *
   * Use this to avoid flooding the host app / reducer with an event per
   * keystroke for a card whose `onChanged` handler is expensive.
   *
   * When the card is used inside a `pi/form` (i.e. `name` is set and a
   * `pi/form` ancestor is present), this prop has no effect: form fields
   * always write back to form state on every keystroke via
   * `form.handleChange`, exactly like `pi/input` and `pi/text-field` — the
   * form's own submit action is the natural "commit" point in that case.
   *
   * Default: `false` (dispatches `onChanged` on every keystroke, as
   * before).
   */
  selfManaged?: boolean;

  /**
   * Trailing-debounce window (ms) for committing changes while
   * `selfManaged` is true (standalone mode only). `0` (default) means no
   * debounce — the value is only committed on blur. Ignored when
   * `selfManaged` is `false`, or when the card is inside a `pi/form`.
   */
  debounceMs?: number;

  /** Additional class names merged onto the root `<textarea>`. */
  className?: string;

  /** Additional inline styles merged onto the root `<textarea>` (highest precedence). */
  style?: CSSProperties;

  /**
   * When true, the textarea grabs keyboard focus the first time it is
   * mounted/shown (e.g. when a dialog or drawer opens). Only applies once,
   * on mount — it does not re-focus on subsequent re-renders.
   */
  autoFocus?: boolean;
};

export type PiTextAreaChangedEvent = {
  /** Field name, mirrors the `name` prop if provided. */
  name?: string;
  /** New value after the change. */
  value: string;
};

export type PiTextAreaSubmittedEvent = {
  /** Field name, mirrors the `name` prop if provided. */
  name?: string;
  /** The current text at the time Enter was pressed. */
  value: string;
};

export type PiTextAreaEvents = {
  onChanged: PiTextAreaChangedEvent;
  onSubmitted: PiTextAreaSubmittedEvent;
};
