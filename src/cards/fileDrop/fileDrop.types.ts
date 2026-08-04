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

/** Per-element Tailwind / CSS class overrides for the FileDrop card. */
export type FileDropClassNames = {
  /** Outermost wrapper `<div>`. Overrides the legacy `className` prop. */
  root?: string;
  /** Inner drop-zone content wrapper `<div>`. */
  dropZone?: string;
  /** Icon wrapper `<div>`. */
  icon?: string;
  /** `<h3>` title element. */
  title?: string;
  /** Description `<span>`. */
  description?: string;
  /** Browse-button `<div>`. */
  browseButton?: string;
};

// ── Theme registry ───────────────────────────────────────────────────────────

const _fileDropThemes: Record<string, FileDropClassNames> = {};

/**
 * Register a named FileDrop theme.
 * Use the returned name string as the `theme` prop on a `FileDrop` card.
 * Per-card `classNames` always override the theme.
 *
 * @example
 * ```ts
 * export const UPLOAD_THEME = registerFileDropTheme("upload-card", {
 *   root: "flex items-center justify-center p-8 rounded-2xl border border-dashed ...",
 *   dropZone: "flex flex-col items-center gap-3 text-center",
 *   ...
 * });
 * ```
 */
export function registerFileDropTheme(
  name: string,
  classNames: FileDropClassNames,
): string {
  if (_fileDropThemes[name] !== undefined) {
    console.warn(
      `FileDrop theme '${name}' is already registered — overwriting`,
    );
  }
  _fileDropThemes[name] = classNames;
  return name;
}

/** Resolve a registered theme by name. Returns `undefined` for unknown names. */
export function getFileDropTheme(name: string): FileDropClassNames | undefined {
  return _fileDropThemes[name];
}

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

  /** Registered icon name (see src/pihanga/icons.ts) rendered above the title. */
  icon?: string;
  /** Extra props forwarded to the icon element (e.g. `{ className: "size-6" }`). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  iconProps?: Record<string, any>;
  /** Label for the browse-files button. When omitted the button is not rendered. */
  browseLabel?: string;

  style?: S;
  /**
   * Name of a pre-registered theme (see `registerFileDropTheme`).
   * Per-card `classNames` always override the theme on a key-by-key basis.
   */
  theme?: string;
  /**
   * Per-element class overrides. Merged on top of any resolved `theme`.
   * `classNames.root` takes precedence over the legacy `className` prop.
   */
  classNames?: FileDropClassNames;
  /** @deprecated Prefer `classNames.root`. Kept for backward compatibility. */
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
