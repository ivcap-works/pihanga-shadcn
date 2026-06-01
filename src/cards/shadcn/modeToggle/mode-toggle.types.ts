import type {VariantT} from "@pihanga2/cards";
import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const MODE_TOGGLE_CARD = "mode-toggle";
export const ModeToggle = createCardDeclaration<
  ModeToggleProps,
  ModeToggleEvents
>(MODE_TOGGLE_CARD);

export const MODE_TOGGLE_ACTION = registerActions(MODE_TOGGLE_CARD, [
  "mode_changed",
]);

export const onModeToggleClicked = createOnAction<ModeChangeEvent>(
  MODE_TOGGLE_ACTION.MODE_CHANGED
);

export type ModeToggleProps = {
  variant?: VariantT;
  className?: string;
};

export type ModeChangeEvent = {
  mode: "light" | "dark" | "system";
};

export type ModeToggleEvents = {
  onModeChanged: ModeChangeEvent;
};
