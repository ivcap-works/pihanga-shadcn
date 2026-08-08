import {Card, type PiCardProps} from "@pihanga2/core";
import React, {useEffect, useRef} from "react";

import type {
  KeyboardOverlayEvents,
  KeyboardOverlayProps,
  Modifier,
} from "./keyboardOverlay.types";

/** Walk up the DOM from `el` and return the first value of `data-{dataKey}` found. */
function findDataAttribute(
  el: Element | null,
  dataKey: string,
): string | undefined {
  let node: Element | null = el;
  while (node) {
    const attr = node.getAttribute(`data-${dataKey}`);
    if (attr) return attr;
    node = node.parentElement;
  }
  return undefined;
}

/** Returns `true` when the keyboard event's active modifiers exactly match the definition. */
function modifiersMatch(e: KeyboardEvent, required: Modifier[]): boolean {
  const need = new Set(required);
  return (
    (need.has("ctrl") ? e.ctrlKey : !e.ctrlKey) &&
    (need.has("shift") ? e.shiftKey : !e.shiftKey) &&
    (need.has("alt") ? e.altKey : !e.altKey) &&
    (need.has("meta") ? e.metaKey : !e.metaKey)
  );
}

export const KeyboardOverlayComponent = (
  props: PiCardProps<KeyboardOverlayProps, KeyboardOverlayEvents>,
): React.ReactNode => {
  const {
    content,
    shortcuts,
    onShortcut,
    cardName,
    className,
    style,
    captureFocus = true,
    dataKey = "pihanga",
  } = props;

  // Track cursor position passively — no re-render needed.
  const cursorPos = useRef<{x: number; y: number}>({x: 0, y: 0});
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      cursorPos.current = {x: e.clientX, y: e.clientY};
    };

    const onKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const mods: Modifier[] = shortcut.modifiers ?? [];
        const keyMatch = e.key === shortcut.key || e.code === shortcut.key;
        if (!keyMatch || !modifiersMatch(e, mods)) continue;

        // Only consume the event when propagate !== true.
        if (!shortcut.propagate) {
          e.preventDefault();
          e.stopPropagation();
        }

        const {x, y} = cursorPos.current;
        const el = document.elementFromPoint(x, y);
        const dataValue = findDataAttribute(el, dataKey);

        onShortcut({
          shortcutId: shortcut.id ?? shortcut.key,
          key: shortcut.key,
          modifiers: mods,
          dataValue,
          cursorX: x,
          cursorY: y,
        });
        break;
      }
    };

    // capture:true ensures we see the keydown before any focused child element.
    document.addEventListener("mousemove", onMouseMove, {passive: true});
    document.addEventListener("keydown", onKeyDown, {capture: true});
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("keydown", onKeyDown, {capture: true});
    };
  }, [shortcuts, onShortcut, dataKey]);

  function onMouseEnter() {
    if (captureFocus) {
      divRef.current?.focus();
    }
  }

  return (
    <div
      ref={divRef}
      tabIndex={captureFocus ? -1 : undefined}
      onMouseEnter={onMouseEnter}
      data-pihanga={cardName}
      className={className}
      style={{...style, position: "relative", outline: "none"}}
    >
      <Card cardName={content} parentCard={cardName} />
    </div>
  );
};
