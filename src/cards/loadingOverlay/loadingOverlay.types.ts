import {createCardDeclaration, type PiCardRef} from "@pihanga2/core";

export const LOADING_OVERLAY_CARD = "loading-overlay";

export type LoadingOverlayProps = {
  content: PiCardRef;
  isLoading?: boolean;
  label?: string;
  fillParent?: boolean;
  viewportCentered?: boolean;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
};

export const LoadingOverlay = createCardDeclaration<LoadingOverlayProps>(
  LOADING_OVERLAY_CARD,
);
