import {
  createCardDeclaration,
  createOnAction,
  type PiCardRef,
  registerActions,
} from "@pihanga2/core";

export const PI_SHEET_CARD = "pi/sheet";

export const Sheet = createCardDeclaration<PiSheetProps, PiSheetEvents>(
  PI_SHEET_CARD,
);

export const PI_SHEET_ACTION = registerActions(PI_SHEET_CARD, [
  "opened",
  "closed",
  "open_changed",
]);

export const onSheetOpened = createOnAction<SheetOpenedEvent>(
  PI_SHEET_ACTION.OPENED,
);

export const onSheetClosed = createOnAction<SheetClosedEvent>(
  PI_SHEET_ACTION.CLOSED,
);

export const onSheetOpenChanged = createOnAction<SheetOpenChangedEvent>(
  PI_SHEET_ACTION.OPEN_CHANGED,
);

export type PiSheetProps = {
  /**
   * Optional id passed through to events for identification.
   */
  id?: string;

  /**
   * Optional trigger card (e.g. a Button).
   *
   * When provided, clicking it opens the sheet.
   * When omitted, control the sheet via the `open` prop.
   */
  trigger?: PiCardRef;

  /**
   * Card to render as the sheet body content.
   */
  content: PiCardRef;

  /**
   * Optional sheet title (rendered in header).
   */
  title?: string;

  /**
   * Optional sheet description (rendered below title).
   */
  description?: string;

  /**
   * Controlled open state.
   * When provided, visibility is fully managed externally.
   */
  open?: boolean;

  /**
   * Which edge the sheet slides in from.
   * @default "right"
   */
  side?: "top" | "right" | "bottom" | "left";

  /**
   * Optional footer card.
   * When provided, takes precedence over the default close button.
   */
  footer?: PiCardRef;

  /**
   * Text for the default close button in the footer.
   * Set to `null` to hide the default close button.
   * @default "Close"
   */
  footerCloseButtonText?: string | null;

  /**
   * Additional CSS classes for the sheet content panel.
   */
  className?: string;

  /**
   * Additional CSS classes for the sheet header.
   */
  headerClassName?: string;

  /**
   * Additional CSS classes for the sheet body (wraps `content`).
   */
  contentClassName?: string;

  /**
   * Additional CSS classes for the sheet footer.
   */
  footerClassName?: string;
};

export type SheetOpenedEvent = {
  id?: string;
};

export type SheetClosedEvent = {
  id?: string;
  /**
   * - 'user': dismissed by user (outside click, ESC, X button)
   * - 'programmatic': closed via props.open change
   */
  reason?: "user" | "programmatic";
};

export type SheetOpenChangedEvent = {
  open: boolean;
  id?: string;
};

export type PiSheetEvents = {
  onOpened: SheetOpenedEvent;
  onClosed: SheetClosedEvent;
  onOpenChanged: SheetOpenChangedEvent;
};
