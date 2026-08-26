import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {TextAreaComponent} from "./textArea.component";
import {PI_TEXT_AREA_ACTION, PI_TEXT_AREA_CARD} from "./textArea.types";

export * from "./textArea.types";

registerCardComponent({
  name: PI_TEXT_AREA_CARD,
  component: TextAreaComponent,
  events: actionTypesToEvents(PI_TEXT_AREA_ACTION),
});
