import {registerCardComponent} from "@pihanga2/core";

import {BadgeComponent} from "./badge.component";
import {BADGE_CARD} from "./badge.types";

export * from "./badge.types";

registerCardComponent({
  name: BADGE_CARD,
  component: BadgeComponent,
});
