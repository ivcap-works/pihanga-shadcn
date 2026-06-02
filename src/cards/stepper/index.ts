import {registerCardComponent} from "@pihanga2/core";

import {StepperComponent} from "./stepper.component";
import {STEPPER_ACTION, STEPPER_CARD} from "./stepper.types";

export * from "./stepper.types";

registerCardComponent({
  name: STEPPER_CARD,
  component: StepperComponent,
  // Explicit mapping avoids CamelCase issues: STEPCLICKED → onStepClicked
  // (actionTypesToEvents would produce onStepclicked with lowercase 'c').
  events: {
    onStepClicked: STEPPER_ACTION.STEPCLICKED,
  },
});
