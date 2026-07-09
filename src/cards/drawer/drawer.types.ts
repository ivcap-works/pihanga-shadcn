import {
  createCardDeclaration,
  createOnAction,
  type PiCardRef,
  registerActions,
} from "@pihanga2/core";

export const PI_DRAWER_CARD = "pi/drawer";

export const Drawer = createCardDeclaration<PiDrawerProps, PiDrawerEvents>(
  PI_DRAWER_CARD,
);

export const PI_DRAWER_ACTION = registerActions(PI_DRAWER_CARD, [
  "opened",
  "closed",
  "open_changed",
]);

export const onDrawerOpened = createOnAction<DrawerOpenedEvent>(
  PI_DRAWER_ACTION.OPENED,
);

export const onDrawerClosed = createOnAction<DrawerClosedEvent>(
  PI_DRAWER_ACTION.CLOSED,
);

export const onDrawerOpenChanged = createOnAction<DrawerOpenChangedEvent>(
  PI_DRAWER_ACTION.OPEN_CHANGED,
);

export type PiDrawerProps = {
  /**
   * Optional id passed through to events for identification.
   */
  id?: string;

  /**
   * Optional drawer trigger card (e.g., a button).
   *
   * When provided, this card will be used as the drawer trigger.
   * When omitted, the drawer must be controlled via the `open` prop.
   */
  trigger?: PiCardRef;

  /**
   * Card to render as the drawer body content.
   */
  content: PiCardRef;

  /**
   * Optional drawer title (rendered in header).
   */
  title?: string;

  /**
   * Optional drawer description (rendered below title).
   */
  description?: string;

  /**
   * Controlled open state.
   *
   * When provided, drawer visibility is fully managed externally.
   * When undefined, drawer manages its own state.
   */
  open?: boolean;

  /**
   * Direction the drawer slides in from.
   * @default "bottom"
   */
  direction?: "top" | "bottom" | "left" | "right";

  /**
   * Whether clicking outside closes the drawer (default: true).
   */
  dismissible?: boolean;

  /**
   * Optional footer card to render at the bottom of the drawer.
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

  /**
   * Additional CSS classes for the drawer content.
   */
  className?: string;
};

export type DrawerOpenedEvent = {
  id?: string;
};

export type DrawerClosedEvent = {
  id?: string;
  /**
   * Reason for closing:
   * - 'user': User dismissed (clicked outside, dragged, or pressed ESC)
   * - 'programmatic': Closed via props.open change
   */
  reason?: "user" | "programmatic";
};

export type DrawerOpenChangedEvent = {
  open: boolean;
  id?: string;
};

export type PiDrawerEvents = {
  onOpened: DrawerOpenedEvent;
  onClosed: DrawerClosedEvent;
  onOpenChanged: DrawerOpenChangedEvent;
};
