import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";

export const JSON_VIEWER_CARD = "json-viewer";

export const JsonViewer = createCardDeclaration<
  JsonViewerProps,
  JsonViewerEvents
>(JSON_VIEWER_CARD);

export const JSON_VIEWER_ACTION = registerActions(JSON_VIEWER_CARD, [
  "clicked",
  "copied",
]);

export const onJsonViewerClicked = createOnAction<ClickedEvent>(
  JSON_VIEWER_ACTION.CLICKED,
);

export const onJsonViewerCopied = createOnAction<CopiedEvent>(
  JSON_VIEWER_ACTION.COPIED,
);

export type JsonViewerProps<S = object> = {
  /** The JSON value to display. */
  source: unknown;
  /**
   * Theme name. Maps loosely to a visual style.
   * Use "monokai", "solarized", "ocean", etc. (visual only — actual theming
   * is done via className / global CSS since react-json-view-lite uses CSS
   * variables rather than named themes).
   */
  theme?: string;
  iconStyle?: "circle" | "triangle" | "square";
  /**
   * When `true`, all nodes are collapsed.
   * When `false`, all nodes are expanded.
   * When a number N, nodes at depth >= N are collapsed (root is depth 0).
   * Default: 1 (expand root only).
   */
  collapsed?: boolean | number;
  /** When `true`, a click-to-expand interaction is enabled on node labels. */
  enableClipboard?: boolean;
  /** When `true`, removes quotes from object keys in display. */
  removeQuotesOnKeys?: boolean;
  /** When `true`, objects and arrays are labelled with their size. */
  displayObjectSize?: boolean;
  /** When `true`, data-type labels prefix values. */
  displayDataTypes?: boolean;
  /**
   * Called after the JSON is rendered, allowing post-render DOM modifications.
   * Receives the raw `source` value and the container element.
   */
  modifyFn?: ModifyFn;

  /**
   * When `true`, shows a copy-to-clipboard icon button in the top-right
   * corner of the viewer. Clicking it copies the pretty-printed JSON to the
   * clipboard using `ClipboardItem` with `text/plain` MIME type.
   */
  copyToClipboard?: boolean;

  /**
   * Icon name resolved via the global icon registry (`getIconElement`).
   * If omitted or the name is not registered, falls back to the Lucide
   * `Copy` icon automatically.
   *
   * @example
   * // Register your own icon first:
   * registerIcon("my-copy", MyCustomCopyIcon);
   * // Then pass the name to the card:
   * JsonViewer({ copyToClipboard: true, copyIcon: "my-copy", ... })
   */
  copyIcon?: string;

  /** Inline style for the react-json-view-lite container. */
  style?: S;
  /** Additional CSS class for the outer wrapper. */
  className?: string;
};

export type ModifyFn = (source: unknown, el: HTMLElement | null) => void;

export type ClickedEvent = Record<string, never>;

export type CopiedEvent = {
  /** `true` when the clipboard write succeeded, `false` on error. */
  success: boolean;
};

export type JsonViewerEvents = {
  onClicked: ClickedEvent;
  onCopied: CopiedEvent;
};
