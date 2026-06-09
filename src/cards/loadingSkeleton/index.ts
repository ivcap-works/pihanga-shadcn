import {registerCardComponent} from "@pihanga2/core";
import {LoadingSkeletonComponent} from "./loading-skeleton.component";
import {LOADING_SKELETON_CARD} from "./loading-skeleton.types";

export * from "./loading-skeleton.types";

// No events — display-only card.
registerCardComponent({
  name: LOADING_SKELETON_CARD,
  component: LoadingSkeletonComponent,
});
