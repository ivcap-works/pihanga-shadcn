import * as React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {AttachmentGroup} from "@/components/ui/attachment";
import type {AttachmentGroupProps} from "./attachment.types";

export const AttachmentGroupComponent = (
  props: PiCardProps<AttachmentGroupProps>,
): React.ReactNode => {
  const {content, className, style, cardName} = props;

  return (
    <AttachmentGroup
      className={className}
      style={style}
      data-pihanga={cardName}
    >
      {content.map((cn, i) => (
        <Card cardName={cn} parentCard={cardName} key={i} />
      ))}
    </AttachmentGroup>
  );
};
