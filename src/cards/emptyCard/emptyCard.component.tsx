import * as React from "react";

import {Card, type PiCardProps} from "@pihanga2/core";
import {Empty, EmptyContent, EmptyMedia} from "@/components/ui/empty";
import {getIcon} from "@/cards/icons";
import type {EmptyCardProps} from "./emptyCard.types";

export const EmptyCardComponent = (
  props: PiCardProps<EmptyCardProps>,
): React.ReactNode => {
  const {icon, content, className, style, cardName} = props;

  return (
    <Empty className={className} style={style} data-pihanga={cardName}>
      {icon && <EmptyMedia variant="icon">{getIcon(icon)}</EmptyMedia>}
      {content && (
        <EmptyContent>
          <Card cardName={content} parentCard={cardName} />
        </EmptyContent>
      )}
    </Empty>
  );
};
