import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {ButtonComponent} from "./button.component";
import {PI_BUTTON_ACTION, PI_BUTTON_CARD} from "./button.types";

export * from "./button.types";

// Optional convenience alias (mirrors older pattern like SdDropDownMenu)
// export const SdButton = createCardDeclaration<PiButtonProps, PiButtonEvents>(
//   PI_BUTTON_CARD,
// );

registerCardComponent({
  name: PI_BUTTON_CARD,
  component: ButtonComponent,
  events: actionTypesToEvents(PI_BUTTON_ACTION),
});
