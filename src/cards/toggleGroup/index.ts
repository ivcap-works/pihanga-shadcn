import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {ToggleGroupComponent} from "./toggleGroup.component";
import {
  PI_TOGGLE_GROUP_ACTION,
  PI_TOGGLE_GROUP_CARD,
} from "./toggleGroup.types";

export * from "./toggleGroup.types";

registerCardComponent({
  name: PI_TOGGLE_GROUP_CARD,
  component: ToggleGroupComponent,
  events: actionTypesToEvents(PI_TOGGLE_GROUP_ACTION),
});
