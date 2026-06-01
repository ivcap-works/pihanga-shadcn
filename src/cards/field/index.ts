import {registerCardComponent} from "@pihanga2/core";

import {FieldCardComponent} from "./field.component";
import {PI_FIELD_CARD} from "./field.types";

export * from "./field.types";

// pi/field has no events of its own; events fire from the inner fieldCard.
registerCardComponent({
  name: PI_FIELD_CARD,
  component: FieldCardComponent,
});
