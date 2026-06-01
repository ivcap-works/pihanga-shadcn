import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {CheckboxComponent} from "./checkbox.component";
import {PI_CHECKBOX_ACTION, PI_CHECKBOX_CARD} from "./checkbox.types";

export * from "./checkbox.types";

registerCardComponent({
  name: PI_CHECKBOX_CARD,
  component: CheckboxComponent,
  events: actionTypesToEvents(PI_CHECKBOX_ACTION),
});
