import {
  createCardDeclaration,
  createOnAction,
  PiCardRef,
  registerActions,
  type DispatchF,
} from "@pihanga2/core";

export const PI_TOAST_CARD = "pi/toast";

export const Toast = createCardDeclaration<PiToastProps, PiToastEvents>(
  PI_TOAST_CARD,
);

export const TOAST_OP_ACTION = registerActions("toast/op", ["show"]);

/**
 * Dispatch helper to show a toast
 *
 * @param d - Dispatch function from Pihanga
 * @param ev - Toast event data
 *
 * @example
 * ```typescript
 * import {dispatchShowToast} from "@/cards/toast";
 *
 * dispatchShowToast(_dispatch, {
 *   message: "Success!",
 *   description: "Your changes were saved.",
 *   variant: "success",
 *   duration: 3000,
 * });
 * ```
 */
export const dispatchShowToast = (d: DispatchF, ev: ShowToastEvent) => {
  d({...ev, type: TOAST_OP_ACTION.SHOW});
};

/**
 * Action handler for when a toast is shown
 *
 * Use this in your reducers or effects to handle toast display events:
 *
 * @example
 * ```typescript
 * import {onShowToast} from "@/cards/toast";
 *
 * export const handleShowToast = onShowToast((state, action) => {
 *   console.log("Toast shown:", action.payload.message);
 *   return state;
 * });
 * ```
 */
export const onShowToast = createOnAction<ShowToastEvent>(TOAST_OP_ACTION.SHOW);

export const PI_TOAST_ACTION = registerActions(PI_TOAST_CARD, ["closed"]);

export const onPiToastClosed = createOnAction<PiToastClosedEvent>(
  PI_TOAST_ACTION.CLOSED,
);

/**
 * Toast notification type/variant.
 */
export type ToastType = "default" | "success" | "error" | "info" | "warning";

/**
 * Position of the toast on the screen.
 */
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type PiToastProps = {
  /**
   * Default variant for toasts shown by this card instance.
   * Can be overridden per individual toast via ShowToastEvent.variant.
   * @default 'default'
   */
  variant?: ToastType;

  /**
   * Default duration in milliseconds before the toast auto-closes.
   * Can be overridden per individual toast via ShowToastEvent.duration.
   * Set to `Infinity` to disable auto-close.
   * @default 4000
   */
  duration?: number;

  /**
   * Whether toasts from this card are dismissible by the user.
   * This is a card-level setting only; it cannot be overridden per individual toast.
   * @default true
   */
  dismissible?: boolean;

  /**
   * Custom CSS class to apply to all toasts from this card.
   */
  className?: string;
};

export type PiToastClosedEvent = {
  id?: string;
};

export type PiToastEvents = {
  onClosed: PiToastClosedEvent;
};

/**
 * Event payload for showing a toast
 */
export type ShowToastEvent = {
  cardName?: string;
  message: string;
  description?: string;
  contentCard?: PiCardRef; // Alternative: custom card for richer content
  variant?: ToastType;
  position?: ToastPosition; // Toast position on screen
  duration?: number;
};
