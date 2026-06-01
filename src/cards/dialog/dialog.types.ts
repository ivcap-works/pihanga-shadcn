import {
  createCardDeclaration,
  createOnAction,
  type PiCardRef,
  registerActions,
} from "@pihanga2/core";

export const PI_DIALOG_CARD = "pi/dialog";

export const Dialog = createCardDeclaration<PiDialogProps, PiDialogEvents>(
  PI_DIALOG_CARD,
);

export const PI_DIALOG_ACTION = registerActions(PI_DIALOG_CARD, [
  "opened",
  "closed",
  "open_changed",
]);

export const onDialogOpened = createOnAction<DialogOpenedEvent>(
  PI_DIALOG_ACTION.OPENED,
);

export const onDialogClosed = createOnAction<DialogClosedEvent>(
  PI_DIALOG_ACTION.CLOSED,
);

export const onDialogOpenChanged = createOnAction<DialogOpenChangedEvent>(
  PI_DIALOG_ACTION.OPEN_CHANGED,
);

export type PiDialogProps = {
  /**
   * Optional id passed through to events for identification.
   */
  id?: string;

  /**
   * Optional dialog trigger card (e.g., a button).
   *
   * When provided, this card will be used as the dialog trigger.
   * When omitted, the dialog must be controlled via the `open` prop.
   *
   * Wrapped in a DOM element so Radix can attach trigger handlers
   * even when rendered via Pihanga's <Card />.
   */
  trigger?: PiCardRef;

  /**
   * Card to render as the dialog body content.
   */
  content: PiCardRef;

  /**
   * Optional dialog title (rendered in header).
   */
  title?: string;

  /**
   * Optional dialog description (rendered in header below title).
   */
  description?: string;

  /**
   * Controlled open state.
   *
   * When provided, dialog visibility is fully managed externally.
   * When undefined, dialog manages its own state.
   */
  open?: boolean;

  /**
   * Dialog size variant.
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

  /**
   * Dialog variant.
   */
  variant?: "modal" | "drawer" | "full";

  /**
   * Desktop variant (defaults to 'modal').
   * On desktop, this variant will be used instead of the main variant.
   */
  desktopVariant?: "modal" | "drawer" | "full";

  /**
   * Mobile variant (defaults to 'drawer').
   * On mobile, this variant will be used instead of the main variant.
   */
  mobileVariant?: "modal" | "drawer" | "full";

  /**
   * Whether clicking outside closes the dialog (default: true).
   */
  dismissible?: boolean;

  /**
   * Hide the X close button (default: false).
   */
  hideClose?: boolean;

  /**
   * Additional CSS classes for the dialog content.
   */
  className?: string;

  /**
   * Optional footer card to render at the bottom of the dialog.
   * When provided, this takes precedence over the default close button.
   */
  footer?: PiCardRef;

  /**
   * Text for the default close button in the footer.
   * Only used when `footer` is not provided.
   * Set to `null` to hide the default close button entirely.
   * @default "Close"
   */
  footerCloseButtonText?: string | null;
};

export type DialogOpenedEvent = {
  id?: string;
};

export type DialogClosedEvent = {
  id?: string;
  /**
   * Reason for closing:
   * - 'user': User dismissed (clicked outside, pressed ESC, clicked X)
   * - 'programmatic': Closed via props.open change
   */
  reason?: "user" | "programmatic";
};

export type DialogOpenChangedEvent = {
  open: boolean;
  id?: string;
};

export type PiDialogEvents = {
  onOpened: DialogOpenedEvent;
  onClosed: DialogClosedEvent;
  onOpenChanged: DialogOpenChangedEvent;
};
