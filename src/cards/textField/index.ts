import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {TextFieldComponent} from "./textField.component";
import {PI_TEXT_FIELD_ACTION, PI_TEXT_FIELD_CARD} from "./textField.types";

export * from "./textField.types";

registerCardComponent({
  name: PI_TEXT_FIELD_CARD,
  component: TextFieldComponent,
  events: actionTypesToEvents(PI_TEXT_FIELD_ACTION),
});
