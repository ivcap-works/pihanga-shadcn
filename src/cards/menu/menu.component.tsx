import React from "react";
import type {PiCardProps} from "@pihanga2/core";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import type {MenuEvents, MenuProps} from "./menu.types";

export const MenuComponent = (
  props: PiCardProps<MenuProps, MenuEvents>,
): React.ReactNode => {
  const {menuButton, items, className, cardName, onClicked} = props;

  return (
    <Menubar className={className} data-pihanga={cardName}>
      <MenubarMenu>
        <MenubarTrigger disabled={menuButton.isDisabled}>
          {menuButton.label}
        </MenubarTrigger>
        <MenubarContent>
          {items.map((item, idx) => {
            if (item === null) {
              return <MenubarSeparator key={idx} />;
            }
            return (
              <MenubarItem
                key={item.id}
                disabled={item.disabled}
                onClick={() => onClicked({itemID: item.id})}
              >
                {item.title ?? item.id}
              </MenubarItem>
            );
          })}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
