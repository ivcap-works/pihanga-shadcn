import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";
import type {VariantT} from "../types";

export const MODE_TOGGLE_CARD = "shad/mode-toggle";
export const ModeToggle = createCardDeclaration<
  ModeToggleProps,
  ModeToggleEvents
>(MODE_TOGGLE_CARD);

export const MODE_TOGGLE_ACTION = registerActions(MODE_TOGGLE_CARD, [
  "mode_changed",
]);

export const onModeToggleChanged = createOnAction<ModeChangeEvent>(
  MODE_TOGGLE_ACTION.MODE_CHANGED,
);

// ---------------------------------------------------------------------------
// Card props & events
// ---------------------------------------------------------------------------

export type ModeToggleProps = {
  /** Visual variant of the toggle button.  Defaults to `"outline"`. */
  variant?: VariantT;
  className?: string;
};

export type ModeChangeEvent = {
  mode: "light" | "dark" | "system";
};

export type ModeToggleEvents = {
  onModeChanged: ModeChangeEvent;
};
