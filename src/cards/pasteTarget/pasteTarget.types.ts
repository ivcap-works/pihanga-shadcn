 
import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const PASTE_TARGET_CARD = "paste-target";
export const PasteTarget = createCardDeclaration<
  PasteTargetProps,
  PasteTargetEvents
>(PASTE_TARGET_CARD);

export const PASTE_TARGET_ACTION = registerActions(PASTE_TARGET_CARD, [
  "pasted_content",
  "error",
]);

export const onContentPasted = createOnAction<CloseEvent>(
  PASTE_TARGET_ACTION.PASTED_CONTENT
);

export const onPasteError = createOnAction<PasteTargetErrorEvent>(
  PASTE_TARGET_ACTION.ERROR
);

export const DEF_HEIGHT = "120px";
export const DEF_SUCCESS_COLOR = "lightgreen";
export const DEF_ERROR_COLOR = "lightred";
export const DEF_EVENT_DURATION_SECONDS = 1;
export const DEF_OVERLAY_OPACITY = 0.5;

export const DEF_PASTE_FIRST_REMINDER =
  "(Before pasting, click this this box to get the focus)";

export type PasteTargetProps = {
  fileTypes?: string[];
  title?: string;
  description?: string;
  pasteFirstReminder?: string;
  withUpload?: boolean;

  height?: string | number;

  successColor?: string;
  errorColor?: string;
  eventDurationSeconds?: number; // How long to show success/error overlay color
  eventOpacity?: number; // Opacity of overlay on paste event

  className?: string;
};

export const DEF_PASTE_TARGET_FILE_TYPES = ["JPG", "PNG", "GIF"];

export type PasteItem = {
  mimeType: string;
  content: string;
};

export type PasteTargetPastedEvent = {
  items: PasteItem[];
};

export type PasteTargetErrorEvent = {
  error: string;
};

export type PasteTargetEvents = {
  onPastedContent: PasteTargetPastedEvent;
  onError: PasteTargetErrorEvent;
};
