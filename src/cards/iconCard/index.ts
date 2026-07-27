import {registerCardComponent} from "@pihanga2/core";

import {IconCardComponent} from "./iconCard.component";
import {ICON_CARD} from "./iconCard.types";

export * from "./iconCard.types";

registerCardComponent({
  name: ICON_CARD,
  component: IconCardComponent,
});
