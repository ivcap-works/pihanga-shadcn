import type {ColorT, DecoratorT, SizeT, VariantT} from "@pihanga2/cards";
import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const MENU_CARD = "menu";
export const Menu = createCardDeclaration<MenuProps, MenuEvents>(MENU_CARD);

export const MENU_ACTION = registerActions(MENU_CARD, ["clicked"]);

export const onXXX = createOnAction<MenuClickEvent>(MENU_ACTION.CLICKED);

// put that into button.ts
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

export type MenuItemT = {
  id: string;
  title?: string;
  disabled?: boolean;
  color?: ColorT;
  variant?: VariantT;
  startDecorator?: DecoratorT;
  endDecorator?: DecoratorT;
};
export type MenuSeparatorT = null;

export type MenuProps<S = unknown, T = unknown> = {
  menuButton: BaseButtonProps;
  items: (MenuItemT | MenuSeparatorT)[];
  placement?: PlacementT;
  size?: SizeT;
  color?: ColorT;
  variant?: VariantT;
  className?: string;
  style?: S;
  theme?: T;
};

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

export type MenuClickEvent = {
  itemID: string;
};

export type MenuEvents = {
  onClicked: MenuClickEvent;
};
