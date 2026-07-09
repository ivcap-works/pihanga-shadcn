import {registerCardComponent} from "@pihanga2/core";

import {AvatarComponent} from "./avatar.component";
import {AVATAR_CARD} from "./avatar.types";

export * from "./avatar.types";

registerCardComponent({
  name: AVATAR_CARD,
  component: AvatarComponent,
});
