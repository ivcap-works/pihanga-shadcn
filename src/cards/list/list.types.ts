import * as React from "react";
import {
  type PiCardRef,
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const LIST_CARD = "shad/list";

export const List = createCardDeclaration<ListProps, ListEvents>(LIST_CARD);

export const LIST_ACTION = registerActions(LIST_CARD, ["item_clicked"]);

export const onListItemClicked = createOnAction<ItemClickedEvent>(
  LIST_ACTION.ITEM_CLICKED,
);

// Decorator shown before or after an item's title/subtitle block.
export type IconDecorator = {
  type: "icon";
  /** Name registered via registerIcon() in src/cards/icons.ts */
  name: string;
  className?: string;
};

export type AvatarDecorator = {
  type: "avatar";
  src: string;
  fallback?: string;
  className?: string;
};

export type ChipDecorator = {
  type: "chip";
  text: string;
  className?: string;
};

export type CardDecorator = {
  type: "card";
  cardName: PiCardRef;
};

export type DecoratorT =
  | IconDecorator
  | AvatarDecorator
  | ChipDecorator
  | CardDecorator;

export type ListItem = {
  /** React key — must be unique within the list. */
  id: string | number;
  isSelected?: boolean;
  title: string;
  subTitle?: string;
  /** When present the item becomes a collapsible parent. */
  nested?: ListItem[];
  startDecorator?: DecoratorT;
  endDecorator?: DecoratorT;
  /** Extra CSS classes on this item's button. */
  className?: string;
};

export type ListProps = {
  items: ListItem[];
  /** Visual density — defaults to "md". */
  size?: "sm" | "md" | "lg";
  /**
   * CSS `list-style-type` value (e.g. "disc", "decimal", "none").
   * Defaults to "none" (plain list without markers).
   */
  marker?: string;
  /** CSS classes applied directly to the root `<ul>`. */
  className?: string;
  /** Inline styles applied directly to the root `<ul>`. */
  style?: React.CSSProperties;
};

export type ItemClickedEvent = {
  itemID: string | number;
};

export type ListEvents = {
  onItemClicked: ItemClickedEvent;
};
