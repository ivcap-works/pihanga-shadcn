import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {ToastComponent} from "./toast.component";
import {PI_TOAST_ACTION, PI_TOAST_CARD} from "./toast.types";

export * from "./toast.types";

registerCardComponent({
  name: PI_TOAST_CARD,
  component: ToastComponent,
  events: actionTypesToEvents(PI_TOAST_ACTION),
});
