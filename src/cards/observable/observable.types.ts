import {
  type PiCardRef,
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const OBSERVABLE_CARD = "shad/observable";

export const Observable = createCardDeclaration<
  ObservableProps,
  ObservableEvents
>(OBSERVABLE_CARD);

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export const OBSERVABLE_ACTION = registerActions(OBSERVABLE_CARD, [
  "clicked",
  "double_clicked",
  "mouse_down",
  "mouse_up",
  "mouse_enter",
  "mouse_move",
  "mouse_leave",
  "context_menu",
  "wheel",
  "key_down",
  "key_up",
  "focus",
  "blur",
]);

export const onObservableClicked = createOnAction<ObservableMouseEvent>(
  OBSERVABLE_ACTION.CLICKED,
);
export const onObservableDoubleClicked = createOnAction<ObservableMouseEvent>(
  OBSERVABLE_ACTION.DOUBLE_CLICKED,
);
export const onObservableMouseDown = createOnAction<ObservableMouseEvent>(
  OBSERVABLE_ACTION.MOUSE_DOWN,
);
export const onObservableMouseUp = createOnAction<ObservableMouseEvent>(
  OBSERVABLE_ACTION.MOUSE_UP,
);
export const onObservableMouseEnter = createOnAction<ObservableMouseEvent>(
  OBSERVABLE_ACTION.MOUSE_ENTER,
);
export const onObservableMouseMove = createOnAction<ObservableMouseEvent>(
  OBSERVABLE_ACTION.MOUSE_MOVE,
);
export const onObservableMouseLeave = createOnAction<ObservableMouseEvent>(
  OBSERVABLE_ACTION.MOUSE_LEAVE,
);
export const onObservableContextMenu = createOnAction<ObservableMouseEvent>(
  OBSERVABLE_ACTION.CONTEXT_MENU,
);
export const onObservableWheel = createOnAction<ObservableWheelEvent>(
  OBSERVABLE_ACTION.WHEEL,
);
export const onObservableKeyDown = createOnAction<ObservableKeyEvent>(
  OBSERVABLE_ACTION.KEY_DOWN,
);
export const onObservableKeyUp = createOnAction<ObservableKeyEvent>(
  OBSERVABLE_ACTION.KEY_UP,
);
export const onObservableFocus = createOnAction<ObservableFocusEvent>(
  OBSERVABLE_ACTION.FOCUS,
);
export const onObservableBlur = createOnAction<ObservableFocusEvent>(
  OBSERVABLE_ACTION.BLUR,
);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Flags to selectively enable interaction events on the `Observable` card.
 *
 * An event is only wired up (listened for on the DOM) **and** reported (its
 * `onXxx` callback fired) when its corresponding flag is `true`. Disabled
 * events incur zero overhead — no listener is even attached.
 */
export type ObservableEnabledEvents = {
  /** Single click. */
  clicked?: boolean;
  /** Double click. */
  doubleClicked?: boolean;
  /** Mouse button pressed down. */
  mouseDown?: boolean;
  /** Mouse button released. */
  mouseUp?: boolean;
  /** Pointer entered the bounding box. */
  mouseEnter?: boolean;
  /** Pointer moved while inside the bounding box. */
  mouseMove?: boolean;
  /** Pointer left the bounding box. */
  mouseLeave?: boolean;
  /** Right-click / context-menu request. */
  contextMenu?: boolean;
  /** Mouse wheel / trackpad scroll. */
  wheel?: boolean;
  /** Key pressed down (requires the root to be focused). */
  keyDown?: boolean;
  /** Key released (requires the root to be focused). */
  keyUp?: boolean;
  /** Root element gained focus. */
  focus?: boolean;
  /** Root element lost focus. */
  blur?: boolean;
};

export type ObservableProps<S = object> = {
  /** Optional caller-defined id, echoed back in every emitted event. */
  id?: string;

  /** Single child card rendered inside the transparent wrapper `<div>`. */
  content?: PiCardRef;

  /**
   * Selectively enable which interaction events are captured and reported.
   * Any event not set to `true` here is neither listened for nor emitted.
   */
  enable?: ObservableEnabledEvents;

  /** Additional Tailwind / CSS utility classes for the wrapper `<div>`. */
  className?: string;
  /** Inline style object for the wrapper `<div>`. */
  style?: S;

  /** Arbitrary data attributes rendered as `data-{key}={value}` on the root element */
  data?: Record<string, string>;
};

// ---------------------------------------------------------------------------
// Event payloads
// ---------------------------------------------------------------------------

/**
 * Pointer position reported by every mouse/wheel event.
 *
 * - `absoluteX` / `absoluteY` — relative to the top-left of the **page**
 *   (i.e. `event.pageX` / `event.pageY`; includes scroll offset).
 * - `relativeX` / `relativeY` — relative to the top-left of the
 *   `Observable` card's own bounding box.
 */
export type ObservablePointerPosition = {
  absoluteX: number;
  absoluteY: number;
  relativeX: number;
  relativeY: number;
};

export type ObservableMouseEvent = ObservablePointerPosition & {
  id?: string;
  /** Mouse button that triggered the event (`MouseEvent.button`). */
  button?: number;
  /** Bitmask of currently-pressed buttons (`MouseEvent.buttons`). */
  buttons?: number;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
};

export type ObservableWheelEvent = ObservablePointerPosition & {
  id?: string;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
};

export type ObservableKeyEvent = {
  id?: string;
  key: string;
  code: string;
  repeat: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
};

export type ObservableFocusEvent = {
  id?: string;
};

export type ObservableEvents = {
  onClicked: ObservableMouseEvent;
  onDoubleClicked: ObservableMouseEvent;
  onMouseDown: ObservableMouseEvent;
  onMouseUp: ObservableMouseEvent;
  onMouseEnter: ObservableMouseEvent;
  onMouseMove: ObservableMouseEvent;
  onMouseLeave: ObservableMouseEvent;
  onContextMenu: ObservableMouseEvent;
  onWheel: ObservableWheelEvent;
  onKeyDown: ObservableKeyEvent;
  onKeyUp: ObservableKeyEvent;
  onFocus: ObservableFocusEvent;
  onBlur: ObservableFocusEvent;
};
