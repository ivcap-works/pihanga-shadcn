import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {MenuComponent} from "./menu.component";
import {MENU_ACTION, MENU_CARD} from "./menu.types";

export * from "./menu.types";

registerCardComponent({
  name: MENU_CARD,
  component: MenuComponent,
  events: actionTypesToEvents(MENU_ACTION),
});
