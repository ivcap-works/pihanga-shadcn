import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {AttachmentComponent} from "./attachment.component";
import {AttachmentGroupComponent} from "./attachmentGroup.component";
import {
  ATTACHMENT_ACTION,
  ATTACHMENT_CARD,
  ATTACHMENT_GROUP_CARD,
} from "./attachment.types";

export * from "./attachment.types";

registerCardComponent({
  name: ATTACHMENT_CARD,
  component: AttachmentComponent,
  events: actionTypesToEvents(ATTACHMENT_ACTION),
});

registerCardComponent({
  name: ATTACHMENT_GROUP_CARD,
  component: AttachmentGroupComponent,
});
