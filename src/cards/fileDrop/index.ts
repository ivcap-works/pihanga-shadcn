import {actionTypesToEvents, registerCardComponent} from "@pihanga2/core";

import {FileDropComponent} from "./fileDrop.component";
import {FILE_DROP_ACTION, FILE_DROP_CARD} from "./fileDrop.types";

export * from "./fileDrop.types";
export {get_last_dropped} from "./fileDrop.component";

registerCardComponent({
  name: FILE_DROP_CARD,
  component: FileDropComponent,
  events: actionTypesToEvents(FILE_DROP_ACTION),
});
