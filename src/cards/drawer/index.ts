import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {DrawerComponent} from "./drawer.component";
import {PI_DRAWER_ACTION, PI_DRAWER_CARD} from "./drawer.types";

export * from "./drawer.types";

registerCardComponent({
  name: PI_DRAWER_CARD,
  component: DrawerComponent,
  events: actionTypesToEvents(PI_DRAWER_ACTION),
});
