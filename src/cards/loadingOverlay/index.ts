import {registerCardComponent} from "@pihanga2/core";

import {LoadingOverlayComponent} from "./loadingOverlay.component";
import {LOADING_OVERLAY_CARD} from "./loadingOverlay.types";

export * from "./loadingOverlay.types";

registerCardComponent({
  name: LOADING_OVERLAY_CARD,
  component: LoadingOverlayComponent,
});
