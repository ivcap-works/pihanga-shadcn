import {registerCardComponent} from "@pihanga2/core";

import {InfoCardComponent} from "./infoCard.component";
import {INFO_CARD} from "./infoCard.types";

export * from "./infoCard.types";

registerCardComponent({
  name: INFO_CARD,
  component: InfoCardComponent,
});
