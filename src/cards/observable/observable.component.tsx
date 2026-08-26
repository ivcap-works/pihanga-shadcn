import * as React from "react";

import {Card, type PiCardProps} from "@pihanga2/core";
import type {
  ObservableEnabledEvents,
  ObservableEvents,
  ObservableKeyEvent,
  ObservableMouseEvent,
  ObservableProps,
  ObservableWheelEvent,
} from "./observable.types";

function pointerPosition(
  e: {pageX: number; pageY: number},
  rect: DOMRect,
): {
  absoluteX: number;
  absoluteY: number;
  relativeX: number;
  relativeY: number;
} {
  return {
    absoluteX: e.pageX,
    absoluteY: e.pageY,
    relativeX: e.pageX - (rect.left + window.scrollX),
    relativeY: e.pageY - (rect.top + window.scrollY),
  };
}

export const ObservableComponent = (
  props: PiCardProps<ObservableProps, ObservableEvents>,
): React.ReactNode => {
  const {
    id,
    content,
    enable = {} as ObservableEnabledEvents,
    className,
    style,
    data,
    cardName,
    onClicked,
    onDoubleClicked,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onContextMenu,
    onWheel,
    onKeyDown,
    onKeyUp,
    onFocus,
    onBlur,
  } = props;

  const rootRef = React.useRef<HTMLDivElement>(null);

  function mouseEvent(
    e: React.MouseEvent<HTMLDivElement>,
  ): ObservableMouseEvent {
    const rect =
      rootRef.current?.getBoundingClientRect() ??
      ({
        left: 0,
        top: 0,
      } as DOMRect);
    return {
      id,
      button: e.button,
      buttons: e.buttons,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
      ...pointerPosition(e, rect),
    };
  }

  function wheelEvent(
    e: React.WheelEvent<HTMLDivElement>,
  ): ObservableWheelEvent {
    const rect =
      rootRef.current?.getBoundingClientRect() ??
      ({
        left: 0,
        top: 0,
      } as DOMRect);
    return {
      id,
      deltaX: e.deltaX,
      deltaY: e.deltaY,
      deltaZ: e.deltaZ,
      ...pointerPosition(e, rect),
    };
  }

  function keyEvent(
    e: React.KeyboardEvent<HTMLDivElement>,
  ): ObservableKeyEvent {
    return {
      id,
      key: e.key,
      code: e.code,
      repeat: e.repeat,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
    };
  }

  const dataAttrs = data
    ? Object.fromEntries(Object.entries(data).map(([k, v]) => [`data-${k}`, v]))
    : {};

  // Only wire up handlers for events that are explicitly enabled.
  const handlers: Record<string, unknown> = {};

  if (enable.clicked) {
    handlers.onClick = (e: React.MouseEvent<HTMLDivElement>) =>
      onClicked(mouseEvent(e));
  }
  if (enable.doubleClicked) {
    handlers.onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) =>
      onDoubleClicked(mouseEvent(e));
  }
  if (enable.mouseDown) {
    handlers.onMouseDown = (e: React.MouseEvent<HTMLDivElement>) =>
      onMouseDown(mouseEvent(e));
  }
  if (enable.mouseUp) {
    handlers.onMouseUp = (e: React.MouseEvent<HTMLDivElement>) =>
      onMouseUp(mouseEvent(e));
  }
  if (enable.mouseEnter) {
    handlers.onMouseEnter = (e: React.MouseEvent<HTMLDivElement>) =>
      onMouseEnter(mouseEvent(e));
  }
  if (enable.mouseMove) {
    handlers.onMouseMove = (e: React.MouseEvent<HTMLDivElement>) =>
      onMouseMove(mouseEvent(e));
  }
  if (enable.mouseLeave) {
    handlers.onMouseLeave = (e: React.MouseEvent<HTMLDivElement>) =>
      onMouseLeave(mouseEvent(e));
  }
  if (enable.contextMenu) {
    handlers.onContextMenu = (e: React.MouseEvent<HTMLDivElement>) =>
      onContextMenu(mouseEvent(e));
  }
  if (enable.wheel) {
    handlers.onWheel = (e: React.WheelEvent<HTMLDivElement>) =>
      onWheel(wheelEvent(e));
  }
  if (enable.keyDown) {
    handlers.onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) =>
      onKeyDown(keyEvent(e));
  }
  if (enable.keyUp) {
    handlers.onKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) =>
      onKeyUp(keyEvent(e));
  }
  if (enable.focus) {
    handlers.onFocus = () => onFocus({id});
  }
  if (enable.blur) {
    handlers.onBlur = () => onBlur({id});
  }

  // Keyboard events require the element to be focusable.
  const needsTabIndex = Boolean(
    enable.keyDown || enable.keyUp || enable.focus || enable.blur,
  );

  return (
    <div
      ref={rootRef}
      className={className}
      style={style as React.CSSProperties}
      data-pihanga={cardName}
      tabIndex={needsTabIndex ? 0 : undefined}
      {...dataAttrs}
      {...handlers}
    >
      {content && <Card cardName={content} parentCard={cardName} />}
    </div>
  );
};
