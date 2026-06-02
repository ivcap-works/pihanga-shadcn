import {registerCardComponent} from "@pihanga2/core";

import {ResizableComponent} from "./resizable.component";
import {RESIZABLE_CARD} from "./resizable.types";

export * from "./resizable.types";

registerCardComponent({
  name: RESIZABLE_CARD,
  component: ResizableComponent,
});
