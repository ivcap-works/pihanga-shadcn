import {registerCardComponent} from "@pihanga2/core";

import {SliderValueComponent} from "./sliderValue.component";
import {PI_SLIDER_VALUE_CARD} from "./sliderValue.types";

export * from "./sliderValue.types";

registerCardComponent({
  name: PI_SLIDER_VALUE_CARD,
  component: SliderValueComponent,
});
