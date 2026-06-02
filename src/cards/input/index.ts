import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {InputComponent} from "./input.component";
import {PI_INPUT_ACTION, PI_INPUT_CARD} from "./input.types";

export * from "./input.types";

registerCardComponent({
  name: PI_INPUT_CARD,
  component: InputComponent,
  events: actionTypesToEvents(PI_INPUT_ACTION),
});
