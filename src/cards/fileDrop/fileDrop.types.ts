import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const FILE_DROP_CARD = "shad/file-drop";

export const FileDrop = createCardDeclaration<FileDropProps, FileDropEvents>(
  FILE_DROP_CARD,
);

export const FILE_DROP_ACTION = registerActions(FILE_DROP_CARD, [
  "file_dropped",
  "error",
]);

export const onFileDropped = createOnAction<FileDroppedEvent>(
  FILE_DROP_ACTION.FILE_DROPPED,
);

export const onFileDropError = createOnAction<FileDropErrorEvent>(
  FILE_DROP_ACTION.ERROR,
);

export type FileDropProps<S = Record<string, unknown>> = {
  /** Accepted file extensions, e.g. ["JPG", "PNG", "PDF"]. Defaults to ["JPG", "PNG", "GIF"]. */
  fileTypes?: string[];
  /** Heading shown inside the drop zone. */
  title?: string;
  /** Secondary text shown inside the drop zone. */
  description?: string;
  /** When true, shows a progress bar instead of the drop zone. */
  showProgress?: boolean;
  /** Inline styles applied to the drop zone wrapper. */
  dropStyle?: Record<string, unknown>;
  /** Inline styles applied to the progress bar container. */
  progressStyle?: Record<string, unknown>;
  /** Current upload progress (0–100). Only used when `showProgress` is true. */
  progress?: number;

  style?: S;
  className?: string;
};

export const DEF_FILE_DROP_FILE_TYPES = ["JPG", "PNG", "GIF"];

export type FileDroppedEvent = {
  name: string;
  size: number;
  type: string;
};

export type FileDropErrorEvent = {
  error: string;
};

export type FileDropEvents = {
  onFileDropped: FileDroppedEvent;
  onError: FileDropErrorEvent;
};
