import {
  type PiRegister,
  createCardDeclaration,
  actionTypesToEvents,
} from "@pihanga2/core";

import {Component} from "./tabs.component";
import {TABS_ACTION, type TabsProps, type TabsEvents} from "@pihanga2/cards";

const CARD_TYPE = "shad/tabs";
export const SdTabs = createCardDeclaration<TabsProps, TabsEvents>(CARD_TYPE);

export function tabsInit(register: PiRegister): void {
  register.cardComponent({
    name: CARD_TYPE,
    component: Component,
    events: actionTypesToEvents(TABS_ACTION),
  });
}
