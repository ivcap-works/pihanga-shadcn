import {
  createCardDeclaration,
  createOnAction,
  registerActions,
} from "@pihanga2/core";
import type {Extension} from "@codemirror/state";
import type {StreamParser} from "@codemirror/language";

export const CODE_MIRROR_CARD = "code-mirror";

export const CodeMirror = createCardDeclaration<
  CodeMirrorCardProps,
  CodeMirrorCardEvents
>(CODE_MIRROR_CARD);

/** @deprecated Use {@link CodeMirror} instead. */
export const CodeMirrorCard = CodeMirror;

export const CODE_MIRROR_ACTION = registerActions(CODE_MIRROR_CARD, [
  "changed",
]);

export const onCodeMirrorChanged = createOnAction<ChangedEvent>(
  CODE_MIRROR_ACTION.CHANGED,
);

// ── StreamParser registry ────────────────────────────────────────────────────
// Props must only contain JSON-serialisable primitives.  Complex third-party
// types (StreamParser, Extension) are stored here and referenced by string key.

const _streamParserRegistry = new Map<string, StreamParser<unknown>>();

/**
 * Register a StreamParser under a caller-chosen key.
 * Call this once at app initialisation time, before the card is first rendered.
 *
 * @example
 * import { python } from "@codemirror/legacy-modes/mode/python";
 * import { registerStreamParser } from "@pihanga2/codemirror/cards/codeMirror";
 * registerStreamParser("python", python);
 */
export function registerStreamParser(
  key: string,
  parser: StreamParser<unknown>,
): void {
  _streamParserRegistry.set(key, parser);
}

/** @internal — used by the component only. */
export function resolveStreamParser(
  key: string,
): StreamParser<unknown> | undefined {
  return _streamParserRegistry.get(key);
}

// ── Extension registry ───────────────────────────────────────────────────────

const _extensionsRegistry = new Map<string, Extension[]>();

/**
 * Register a bundle of CodeMirror 6 extensions (themes, linters, keymaps, …)
 * under a caller-chosen key.
 * Call this once at app initialisation time, before the card is first rendered.
 *
 * @example
 * import { oneDark } from "@codemirror/theme-one-dark";
 * import { registerExtensions } from "@pihanga2/codemirror/cards/codeMirror";
 * registerExtensions("oneDark", [oneDark]);
 */
export function registerExtensions(key: string, exts: Extension[]): void {
  _extensionsRegistry.set(key, exts);
}

/** @internal — used by the component only. */
export function resolveExtensions(key: string): Extension[] | undefined {
  return _extensionsRegistry.get(key);
}

// ── Card Props ───────────────────────────────────────────────────────────────

export type CodeMirrorCardProps = {
  /** The code content to display or edit. */
  value?: string;

  /** When true the editor is read-only. Default: false. */
  readOnly?: boolean;

  /**
   * Key of a StreamParser previously registered with `registerStreamParser()`.
   * Props must be JSON-serialisable — pass the string key, not the parser itself.
   *
   * @example
   * import { python } from "@codemirror/legacy-modes/mode/python";
   * registerStreamParser("python", python);
   * CodeMirror({ streamLanguage: "python", value: "print('hello')" });
   */
  streamLanguage?: string;

  /**
   * Key of an Extension bundle previously registered with `registerExtensions()`.
   * Props must be JSON-serialisable — pass the string key, not the Extension objects.
   *
   * @example
   * import { oneDark } from "@codemirror/theme-one-dark";
   * registerExtensions("oneDark", [oneDark]);
   * CodeMirror({ extensionsKey: "oneDark", ... });
   *
   * Note: `theme` looks up keys in this same registry, so a bundle registered
   * here can also be used as a theme.
   */
  extensionsKey?: string;

  /**
   * CodeMirror editor theme: "light", "dark", or the key of a theme bundle
   * registered with `registerExtensions()` (e.g. "dracula").  Default: "light".
   *
   * @example
   * import { draculaInit } from "@uiw/codemirror-theme-dracula";
   * registerExtensions("dracula", [draculaInit()]);
   * CodeMirror({ theme: "dracula", ... });
   */
  theme?: "light" | "dark" | (string & {});

  /** Show line numbers in the gutter. Default: true. */
  lineNumbers?: boolean;

  /** Show the fold gutter (code folding). Default: true. */
  foldGutter?: boolean;

  /** Show a drop cursor while dragging text. Default: true. */
  dropCursor?: boolean;

  /** Allow multiple selection ranges. Default: true. */
  allowMultipleSelections?: boolean;

  /** Re-indent the current line as you type. Default: true. */
  indentOnInput?: boolean;

  /**
   * CSS height of the editor.  Use "auto" to grow with content or a fixed
   * value such as "400px".  Default: "auto".
   */
  height?: string;

  /** CSS minimum height of the editor, e.g. "120px". */
  minHeight?: string;

  /** CSS maximum height of the editor, e.g. "600px". Scrolls beyond this. */
  maxHeight?: string;

  /** Additional CSS class applied to the outer wrapper div. */
  className?: string;
};

export type ChangedEvent = {
  /** The updated editor content after each change. */
  value: string;
};

export type CodeMirrorCardEvents = {
  onChanged: ChangedEvent;
};
