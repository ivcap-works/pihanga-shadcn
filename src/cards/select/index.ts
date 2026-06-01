import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {SelectComponent} from "./select.component";
import {PI_SELECT_ACTION, PI_SELECT_CARD} from "./select.types";

export * from "./select.types";

registerCardComponent({
  name: PI_SELECT_CARD,
  component: SelectComponent,
  events: actionTypesToEvents(PI_SELECT_ACTION),
});
