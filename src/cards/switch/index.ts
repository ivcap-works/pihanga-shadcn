import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {SwitchComponent} from "./switch.component";
import {PI_SWITCH_ACTION, PI_SWITCH_CARD} from "./switch.types";

export * from "./switch.types";

registerCardComponent({
  name: PI_SWITCH_CARD,
  component: SwitchComponent,
  events: actionTypesToEvents(PI_SWITCH_ACTION),
});
