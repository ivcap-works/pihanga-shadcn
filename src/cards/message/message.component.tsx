import * as React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message";
import type {MessageProps} from "./message.types";

export const MessageComponent = (
  props: PiCardProps<MessageProps>,
): React.ReactNode => {
  const {
    align = "start",
    avatarCard,
    headerCard,
    contentCard,
    footerCard,
    className,
    avatarClassName,
    contentClassName,
    headerClassName,
    footerClassName,
    style,
    cardName,
  } = props;

  return (
    <Message
      align={align}
      className={className}
      style={style}
      data-pihanga={cardName}
    >
      {avatarCard && (
        <MessageAvatar className={avatarClassName}>
          <Card cardName={avatarCard} parentCard={cardName} />
        </MessageAvatar>
      )}

      <MessageContent className={contentClassName}>
        {headerCard && (
          <MessageHeader className={headerClassName}>
            <Card cardName={headerCard} parentCard={cardName} />
          </MessageHeader>
        )}

        <Card cardName={contentCard} parentCard={cardName} />

        {footerCard && (
          <MessageFooter className={footerClassName}>
            <Card cardName={footerCard} parentCard={cardName} />
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
};
