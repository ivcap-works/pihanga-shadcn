import React, {Fragment} from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {clsx} from "clsx";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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

  // `style` may carry Shadcn-specific class overrides in a `shad` sub-key.
  const shadStyle = style as
    | {shad?: {root?: string; panel?: string; handle?: string}}
    | undefined;
  const sy = shadStyle?.shad ?? {};

  const _handles: PiResizableHandle[] = Array.isArray(handles)
    ? handles
    : Array(content.length - 1).fill(handles ?? DefResizableHandle);

  function renderPanel(el: PiResizablePanel, idx: number) {
    const name = el.name ?? `panel${idx}`;
    const panelProps: {
      defaultSize: number;
      collapsible?: boolean;
      maxSize?: number;
      minSize?: number;
    } = {
      defaultSize: el.defaultSize ?? 50,
      collapsible: el.collapsible,
    };
    if (el.maxSize !== undefined) panelProps.maxSize = el.maxSize;
    if (el.minSize !== undefined) panelProps.minSize = el.minSize;

    return (
      <Fragment key={idx}>
        {renderHandle(idx)}
        <ResizablePanel
          {...panelProps}
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
      direction={direction ?? "horizontal"}
      className={clsx(className, sy.root)}
      data-pihanga={cardName}
    >
      {content.map(renderPanel)}
    </ResizablePanelGroup>
  );
};
