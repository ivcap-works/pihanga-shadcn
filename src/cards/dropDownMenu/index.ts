import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {DROP_DOWN_MENU_ACTION, DROP_DOWN_MENU_CARD} from "./drop-down.types";
import {Component} from "./drop-down.component";

export * from "./drop-down.types";

registerCardComponent({
  name: DROP_DOWN_MENU_CARD,
  component: Component,
  events: actionTypesToEvents(DROP_DOWN_MENU_ACTION),
});
