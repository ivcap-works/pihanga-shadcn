import {registerCardComponent} from "@pihanga2/core";

import {MessageComponent} from "./message.component";
import {MessageGroupComponent} from "./messageGroup.component";
import {MESSAGE_CARD, MESSAGE_GROUP_CARD} from "./message.types";

export * from "./message.types";

registerCardComponent({
  name: MESSAGE_CARD,
  component: MessageComponent,
});

registerCardComponent({
  name: MESSAGE_GROUP_CARD,
  component: MessageGroupComponent,
});
