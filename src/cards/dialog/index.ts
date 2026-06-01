import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {DialogComponent} from "./dialog.component";
import {PI_DIALOG_ACTION, PI_DIALOG_CARD} from "./dialog.types";

export * from "./dialog.types";

registerCardComponent({
  name: PI_DIALOG_CARD,
  component: DialogComponent,
  events: actionTypesToEvents(PI_DIALOG_ACTION),
});
