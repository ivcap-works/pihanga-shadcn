import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {SliderComponent} from "./slider.component";
import {PI_SLIDER_ACTION, PI_SLIDER_CARD} from "./slider.types";

export * from "./slider.types";

registerCardComponent({
  name: PI_SLIDER_CARD,
  component: SliderComponent,
  events: actionTypesToEvents(PI_SLIDER_ACTION),
});
