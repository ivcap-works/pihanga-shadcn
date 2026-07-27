import * as React from "react";

import {Card, type PiCardProps} from "@pihanga2/core";
import type {BoxProps} from "./box.types";

export const BoxComponent = (props: PiCardProps<BoxProps>): React.ReactNode => {
  const {content, singleContent, className, style, cardName} = props;

  const sy: Record<string, string | number> = {
    ...(style as Record<string, string | number> | undefined),
  };
  if (props.height) sy.height = `${props.height}px`;
  if (props.width) sy.width = `${props.width}px`;

  if (props.marginTop) sy.marginTop = `${props.marginTop}px`;
  if (props.marginBottom) sy.marginBottom = `${props.marginBottom}px`;
  if (props.marginLeft) sy.marginLeft = `${props.marginLeft}px`;
  if (props.marginRight) sy.marginRight = `${props.marginRight}px`;

  if (props.paddingTop) sy.paddingTop = `${props.paddingTop}px`;
  if (props.paddingBottom) sy.paddingBottom = `${props.paddingBottom}px`;
  if (props.paddingLeft) sy.paddingLeft = `${props.paddingLeft}px`;
  if (props.paddingRight) sy.paddingRight = `${props.paddingRight}px`;

  const cards = singleContent ? [singleContent] : content;
  function renderContent() {
    if (!cards) return null;
    return cards.map((cn, i) => (
      <Card cardName={cn} parentCard={cardName} key={i} />
    ));
  }

  return (
    <div className={className} style={sy} data-pihanga={cardName}>
      {renderContent()}
      {props.children}
    </div>
  );
};
