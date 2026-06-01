import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {FormComponent} from "./form.component";
import {PI_FORM_ACTION, PI_FORM_CARD} from "./form.types";

export * from "./form.types";
export * from "./form.context";

registerCardComponent({
  name: PI_FORM_CARD,
  component: FormComponent,
  events: actionTypesToEvents(PI_FORM_ACTION),
});
