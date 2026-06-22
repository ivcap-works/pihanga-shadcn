import {createCardDeclaration} from "@pihanga2/core";
import type {CSSProperties} from "react";
import type {PluggableList} from "unified";
import type {Components} from "react-markdown";

export const MARKDOWN_CARD = "markdown-viewer";

export const MarkdownViewer =
  createCardDeclaration<MarkdownViewerProps>(MARKDOWN_CARD);

export type MarkdownViewerProps = {
  /** Markdown source string to render directly. */
  source?: string;
  /** URL/path to a file whose text content will be fetched and rendered. */
  path?: string;
  /**
   * Truncate rendered text to approximately this many characters (word boundary).
   * A negative value (default: -1) disables truncation.
   */
  maxBodyLength?: number;

  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
  remarkRehypeOptions?: object;

  /**
   * Custom element renderers passed directly to `react-markdown`.
   * Merged on top of the card's built-in defaults (code/pre styling).
   * Use this to override how individual HTML elements are rendered.
   */
  components?: Components;

  /** Additional CSS class to apply to the outer wrapper div. */
  className?: string;
  style?: CSSProperties;
};
