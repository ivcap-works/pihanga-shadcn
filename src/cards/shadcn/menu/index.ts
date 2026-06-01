import {
  type PiRegister,
  createCardDeclaration,
  actionTypesToEvents,
} from "@pihanga2/core";

import {Component} from "./menu.component";
import {MENU_ACTION, type MenuProps, type MenuEvents} from "./menu.types";

const CARD_TYPE = "shad/menu";
export const SdMenu = createCardDeclaration<MenuProps, MenuEvents>(CARD_TYPE);

export function menuInit(register: PiRegister): void {
  register.cardComponent({
    name: CARD_TYPE,
    component: Component,
    events: actionTypesToEvents(MENU_ACTION),
  });
}
