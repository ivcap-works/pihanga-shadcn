import {registerCardComponent} from "@pihanga2/core";

import {MarkdownViewerComponent} from "./markdownViewer.component";
import {MARKDOWN_CARD} from "./markdownViewer.types";

export * from "./markdownViewer.types";

registerCardComponent({
  name: MARKDOWN_CARD,
  component: MarkdownViewerComponent,
});
