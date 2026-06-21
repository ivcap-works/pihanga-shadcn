import {registerCardComponent} from "@pihanga2/core";

import {BoxComponent} from "./box.component";
import {BOX_CARD} from "./box.types";

export * from "./box.types";

registerCardComponent({
  name: BOX_CARD,
  component: BoxComponent,
});
