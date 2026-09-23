import * as React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {BubbleGroup} from "@/components/ui/bubble";
import type {BubbleGroupProps} from "./bubble.types";

export const BubbleGroupComponent = (
  props: PiCardProps<BubbleGroupProps>,
): React.ReactNode => {
  const {content, className, style, cardName} = props;

  return (
    <BubbleGroup className={className} style={style} data-pihanga={cardName}>
      {content.map((cn, i) => (
        <Card cardName={cn} parentCard={cardName} key={i} />
      ))}
    </BubbleGroup>
  );
};
