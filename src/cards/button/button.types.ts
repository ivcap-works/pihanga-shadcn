import {
  createCardDeclaration,
  createOnAction,
  type PiCardRef,
  registerActions,
} from "@pihanga2/core";

export const PI_BUTTON_CARD = "pi/button";

export const Button = createCardDeclaration<PiButtonProps, PiButtonEvents>(
  PI_BUTTON_CARD,
);

export const PI_BUTTON_ACTION = registerActions(PI_BUTTON_CARD, ["clicked"]);

export const onButtonClicked = createOnAction<PiButtonClickedEvent>(
  PI_BUTTON_ACTION.CLICKED,
);

/** @deprecated Use `onButtonClicked` instead. */
export const onPiButtonClicked = onButtonClicked;

/**
 * Declarative "opts" subset based on `src/registry/ui/button.tsx`.
 *
 * Notes:
 * - Any icon is referenced by name and resolved via `src/pihanga/icons.ts`.
 * - `children` are provided via `label` (simple) or `content` (card ref).
 */
export type PiButtonOpts = {
  /**
   * Visual style variant of the button.
   * Determines the button's appearance (colors, borders, etc.).
   */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "ghost2"
    | "ghost3"
    | "ghostActive"
    | "brand"
    | "nav"
    | "navAction"
    | "menuAction"
    | "blockAction"
    | "blockActionSecondary"
    | "primaryOutline"
    | "radio"
    | "none";

  /**
   * Size of the button.
   * Controls padding, font size, and overall dimensions.
   */
  size?:
    | "default"
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "icon"
    | "iconSm"
    | "navAction"
    | "menuAction"
    | "blockAction"
    | "none";

  /** Truncate button content with ellipsis if it overflows. */
  truncate?: boolean;

  /** If true, button is rendered as a menu trigger button. */
  isMenu?: boolean;

  /** Custom CSS class to apply to the loading spinner/indicator. */
  loadingClassName?: string;

  /** Icon to display before the button content. Set 'size' to 'icon' if ONLY show icon */
  beforeIcon?: string;

  /** Icon to display after the button content */
  afterIcon?: string;
};

export type PiButtonProps = {
  id?: string; // optional 'id' to be added to events

  /**
   * Optional explicit aria-label.
   *
   * Useful for icon-only / letter-only buttons where the visible content
   * shouldn't be used as the accessible name.
   */
  ariaLabel?: string;

  /**
   * Declarative options; maps closely to `@/registry/ui/button`.
   */
  opts?: PiButtonOpts;

  /** Simple label; used as children and aria-label fallback. */
  label?: string;

  /**
   * Icon name to use as the main button content (instead of text label).
   * Resolved via `src/pihanga/icons.ts`.
   * Takes precedence over `label` and `contentCard`.
   */
  iconLabel?: string;

  /**
   * If set, renders this card as the content instead of `label`.
   * (Useful for rich content.)
   */
  contentCard?: PiCardRef;

  /** When provided, button will render as an anchor. */
  href?: string;
  target?: string;

  tooltip?: string;

  /**
   * If set, renders this card as the tooltip content instead of `tooltip`.
   * (Useful for rich tooltip content.)
   */
  tooltipCard?: PiCardRef;

  /**
   * Controls tooltip visibility mode.
   * - 'auto' (default): Normal hover behavior
   * - 'open': Force tooltip to be visible
   * - 'closed': Force tooltip to be hidden
   */
  tooltipMode?: "auto" | "open" | "closed";

  /**
   * Controls tooltip placement/position.
   * - 'top': Tooltip appears above the button (default)
   * - 'right': Tooltip appears to the right of the button
   * - 'bottom': Tooltip appears below the button
   * - 'left': Tooltip appears to the left of the button
   */
  tooltipPlacement?: "top" | "right" | "bottom" | "left";

  /** Indicates whether the button is in an active/selected state. */
  active?: boolean;

  /** Indicates whether the button has focus state styling applied. */
  focused?: boolean;

  /** If true, disables the button and prevents interaction. */
  disabled?: boolean;

  /** If true, shows loading state and typically disables interaction. */
  loading?: boolean;

  /** If true, indicates an async operation is pending (similar to loading but distinct). */
  isPending?: boolean;

  className?: string;
};

export type PiButtonClickedEvent = {
  id?: string;
};

export type PiButtonEvents = {
  onClicked: PiButtonClickedEvent;
};
