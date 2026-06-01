import React, {Fragment} from "react";
import {Card, type PiCardProps} from "@pihanga2/core";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {clsx} from "clsx";
import {
  DefResizableHandle,
  type PiResizableHandle,
  type PiResizablePanel,
  type ResizableProps,
} from "./resizable.types";

export const ResizableComponent = (
  props: PiCardProps<ResizableProps>,
): React.ReactNode => {
  const {content, handles, direction, className, style, cardName} = props;
  const shadStyle = style as
    | {shad?: {root?: string; panel?: string; handle?: string}}
    | undefined;
  const sy = shadStyle?.shad ?? {};
  const _handles: PiResizableHandle[] = Array.isArray(handles)
    ? handles
    : Array(content.length - 1).fill(handles || DefResizableHandle);

  function renderPanel(el: PiResizablePanel, idx: number) {
    const name = el.name || `panel${idx}`;
    const p: {
      defaultSize: number;
      collapsible?: boolean;
      maxSize?: number;
      minSize?: number;
    } = {
      defaultSize: el.defaultSize || 50,
      collapsible: el.collapsible,
    };
    if (el.maxSize) {
      p.maxSize = el.maxSize;
    }
    if (el.minSize) {
      p.maxSize = el.minSize;
    }

    return (
      <Fragment key={idx}>
        {renderHandle(idx)}
        <ResizablePanel
          {...p}
          className={clsx(sy.panel, className && `${className}-${name}`)}
        >
          <Card cardName={el.content} parentCard={cardName} />
        </ResizablePanel>
      </Fragment>
    );
  }

  function renderHandle(idx: number) {
    if (idx === 0) return null;
    const h = _handles[idx - 1];
    return <ResizableHandle {...h} className={clsx(sy.handle)} />;
  }

  return (
    <ResizablePanelGroup
      direction={direction || "horizontal"}
      className={clsx(className, sy.root)}
      data-pihanga={cardName}
    >
      {content.map(renderPanel)}
    </ResizablePanelGroup>
  );
};
