import React, {useLayoutEffect, useRef, useState, useCallback} from "react";
import {PiCardProps} from "@pihanga2/core";
import {JsonView, allExpanded, defaultStyles} from "react-json-view-lite";
import {Copy, Check} from "lucide-react";
import "react-json-view-lite/dist/index.css";
import "./jsonViewer.css";

import {getIconElement} from "@/cards/icons";
import type {JsonViewerProps, JsonViewerEvents} from "./jsonViewer.types";

/**
 * Converts the `collapsed` prop (from the react-json-view API) into a
 * `shouldExpandNode` predicate for react-json-view-lite.
 *
 * - `false`  → expand everything
 * - `true`   → collapse everything
 * - number N → expand nodes at depth < N (root is depth 0)
 */
function toShouldExpandNode(
  collapsed: boolean | number | undefined,
): (level: number) => boolean {
  if (collapsed === false) return allExpanded;
  if (collapsed === true) return () => false;
  // default: collapsed = 1 → only root level expanded
  const depth = collapsed ?? 1;
  return (level: number) => level < depth;
}

/**
 * Compact, code-editor style for react-json-view-lite.
 *
 * The expand/collapse icon is positioned absolutely inside a fixed left gutter
 * (via padding-left on `.jv-basic-child`), so the opening `{` and closing `}`
 * always start at the same column — fixing the original misalignment where the
 * icon pushed the open-brace further right than the close-brace.
 */
const compactStyles = {
  // spread defaultStyles first to satisfy required fields (ariaLables, stringifyStringValues, …)
  ...defaultStyles,
  container: "jv-container",
  basicChildStyle: "jv-basic-child",
  label: "jv-label",
  clickableLabel: "jv-clickable-label",
  nullValue: "jv-null",
  undefinedValue: "jv-undefined",
  numberValue: "jv-number",
  stringValue: "jv-string",
  booleanValue: "jv-boolean",
  otherValue: "jv-other",
  punctuation: "jv-punctuation",
  expandIcon: "jv-expand-icon",
  collapseIcon: "jv-collapse-icon",
  collapsedContent: "jv-collapsed-content",
  childFieldsContainer: "jv-child-fields-container",
};

/**
 * Resolve the icon element to use for the copy button.
 *
 * Resolution order:
 *   1. `iconName` looked up in the global icon registry
 *   2. Lucide `Copy` as the built-in fallback
 */
function resolveCopyIcon(iconName?: string): React.ElementType {
  if (iconName) {
    const registered = getIconElement(iconName);
    if (registered) return registered;
  }
  return Copy;
}

/** Write `text` to the clipboard, preferring `ClipboardItem` for explicit MIME. */
async function writeToClipboard(text: string): Promise<void> {
  if (typeof ClipboardItem !== "undefined") {
    const blob = new Blob([text], {type: "text/plain"});
    await navigator.clipboard.write([new ClipboardItem({"text/plain": blob})]);
  } else {
    // Fallback for browsers without ClipboardItem support
    await navigator.clipboard.writeText(text);
  }
}

export const JsonViewerComponent = (
  props: PiCardProps<JsonViewerProps, JsonViewerEvents>,
): React.ReactNode => {
  const {
    source,
    collapsed = 1,
    modifyFn,
    style,
    className,
    cardName,
    _cls,
    copyToClipboard,
    copyIcon,
    onCopied,
  } = props;

  const elRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useLayoutEffect(() => {
    if (modifyFn) {
      modifyFn(source, elRef.current);
    }
  }, [modifyFn, source]);

  const shouldExpandNode = toShouldExpandNode(collapsed);

  const handleCopy = useCallback(async () => {
    const text = JSON.stringify(source, null, 2);
    let success = false;
    try {
      await writeToClipboard(text);
      success = true;
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("[JsonViewer] clipboard write failed:", err);
    }
    onCopied?.({success});
  }, [source, onCopied]);

  const CopyIconEl = resolveCopyIcon(copyIcon);
  const ConfirmIconEl = Check;

  return (
    <div
      className={[_cls("root", className), "jv-wrapper"].join(" ")}
      ref={elRef}
      data-pihanga={cardName}
      style={style as React.CSSProperties | undefined}
    >
      {copyToClipboard && (
        <button
          type="button"
          aria-label={copied ? "Copied!" : "Copy JSON to clipboard"}
          title={copied ? "Copied!" : "Copy JSON to clipboard"}
          className={`jv-copy-btn${copied ? " jv-copy-btn--done" : ""}`}
          onClick={handleCopy}
        >
          {copied ? (
            <ConfirmIconEl size={13} strokeWidth={2.5} />
          ) : (
            <CopyIconEl size={13} strokeWidth={2} />
          )}
        </button>
      )}
      <JsonView
        data={source as object | unknown[]}
        shouldExpandNode={shouldExpandNode}
        style={compactStyles}
        clickToExpandNode
      />
    </div>
  );
};
