import * as React from "react";

import {Card, type PiCardProps} from "@pihanga2/core";
import type {BoxProps} from "@pihanga2/cards";

export const BoxComponent = (props: PiCardProps<BoxProps>): React.ReactNode => {
  const {content, className, style, cardName} = props;

  let sy: Record<string, string | number> = {};
  if (props.height) sy.height = `${props.height}px`;
  if (props.width) sy.height = `${props.width}px`;

  if (props.marginTop) sy["margin-top"] = `${props.marginTop}px`;
  if (props.marginBottom) sy["margin-bottom"] = `${props.marginBottom}px`;
  if (props.marginLeft) sy["margin-ledt"] = `${props.marginLeft}px`;
  if (props.marginRight) sy["margin-right"] = `${props.marginRight}px`;

  if (props.paddingTop) sy["padding-top"] = `${props.paddingTop}px`;
  if (props.paddingBottom) sy["padding-bottom"] = `${props.paddingBottom}px`;
  if (props.paddingLeft) sy["padding-ledt"] = `${props.paddingLeft}px`;
  if (props.paddingRight) sy["padding-right"] = `${props.paddingRight}px`;

  sy = {
    ...(style?.shad as Record<string, string | number> | undefined),
  };

  function renderContent() {
    if (!content) return null;
    return content.map((cn, i) => (
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
