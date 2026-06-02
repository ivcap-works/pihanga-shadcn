import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";
import type {ColorT, DecoratorT, SizeT, VariantT} from "../types";

export const MENU_CARD = "shad/menu";
export const Menu = createCardDeclaration<MenuProps, MenuEvents>(MENU_CARD);

export const MENU_ACTION = registerActions(MENU_CARD, ["clicked"]);

export const onMenuClicked = createOnAction<MenuClickEvent>(
  MENU_ACTION.CLICKED,
);

// ---------------------------------------------------------------------------
// Shared button props (re-used by trigger buttons)
// ---------------------------------------------------------------------------

export type BaseButtonProps = {
  label: string;
  tooltip?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  loadingPosition?: "center" | "start" | "end";
  size?: SizeT;
  color?: ColorT;
  variant?: VariantT;
  startDecorator?: DecoratorT;
  endDecorator?: DecoratorT;
};

// ---------------------------------------------------------------------------
// Menu item types
// ---------------------------------------------------------------------------

export type MenuItemT = {
  id: string;
  title?: string;
  disabled?: boolean;
  color?: ColorT;
  variant?: VariantT;
  startDecorator?: DecoratorT;
  endDecorator?: DecoratorT;
};

/** A `null` entry renders as a visual separator between menu items. */
export type MenuSeparatorT = null;

// ---------------------------------------------------------------------------
// Placement
// ---------------------------------------------------------------------------

export type PlacementT =
  | "auto-end"
  | "auto-start"
  | "auto"
  | "bottom-end"
  | "bottom-start"
  | "bottom"
  | "left-end"
  | "left-start"
  | "left"
  | "right-end"
  | "right-start"
  | "right"
  | "top-end"
  | "top-start"
  | "top";

// ---------------------------------------------------------------------------
// Card props & events
// ---------------------------------------------------------------------------

export type MenuProps<S = unknown, T = unknown> = {
  /** Configuration for the trigger button that opens the menu. */
  menuButton: BaseButtonProps;
  /** Ordered list of menu items; `null` entries render as separators. */
  items: (MenuItemT | MenuSeparatorT)[];
  placement?: PlacementT;
  size?: SizeT;
  color?: ColorT;
  variant?: VariantT;
  className?: string;
  style?: S;
  theme?: T;
};

export type MenuClickEvent = {
  /** The `id` of the menu item that was clicked. */
  itemID: string;
};

export type MenuEvents = {
  onClicked: MenuClickEvent;
};
