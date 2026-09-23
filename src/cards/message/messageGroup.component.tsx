import * as React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {MessageGroup} from "@/components/ui/message";
import type {MessageGroupProps} from "./message.types";

export const MessageGroupComponent = (
  props: PiCardProps<MessageGroupProps>,
): React.ReactNode => {
  const {content, className, style, cardName} = props;

  return (
    <MessageGroup className={className} style={style} data-pihanga={cardName}>
      {content.map((cn, i) => (
        <Card cardName={cn} parentCard={cardName} key={i} />
      ))}
    </MessageGroup>
  );
};
