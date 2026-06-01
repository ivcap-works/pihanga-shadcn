import React from "react";
import {getIcon} from "@pihanga2/cards";
import {type DecoratorT, DecoratorE} from "@pihanga2/cards";
import {Card} from "@pihanga2/core";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";

export function renderDecorator(
  d?: DecoratorT,
  parentCard?: string,
): React.ReactNode {
  if (!d) return null;
  switch (d.type) {
    case DecoratorE.Icon: {
      // @ts-expect-error not sure
      const sx = d.sx;
      const className = d.className;
      return getIcon(d.icon, {
        fontSize: d.fontSize,
        color: d.color,
        sx,
        className,
      });
    }
    case DecoratorE.Avatar: {
      const alt = d.fallback || "?";
      return (
        <Avatar>
          <AvatarImage src={d.src} alt="alt" />
          <AvatarFallback>{alt}</AvatarFallback>
        </Avatar>
      );
    }
    case DecoratorE.Chip:
      return <Badge variant="destructive">Chip not supported</Badge>;
    case DecoratorE.Card:
      return <Card cardName={d.cardName} parentCard={parentCard || ""} />;

    default:
      throw new Error("Missing implementation for decorator");
  }
}
