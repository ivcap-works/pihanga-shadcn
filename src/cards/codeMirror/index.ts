import {registerCardComponent, actionTypesToEvents} from "@pihanga2/core";

import {CODE_MIRROR_CARD, CODE_MIRROR_ACTION} from "./codeMirror.types";
import {CodeMirrorComponent} from "./codeMirror.component";

export * from "./codeMirror.types";

registerCardComponent({
  name: CODE_MIRROR_CARD,
  component: CodeMirrorComponent,
  events: actionTypesToEvents(CODE_MIRROR_ACTION),
});
