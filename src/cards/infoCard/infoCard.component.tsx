import * as React from "react";
import {Card as PiCard, type PiCardProps} from "@pihanga2/core";
import {cn} from "@/lib/utils";
import {
  Card,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import type {InfoCardProps} from "./infoCard.types";

export const InfoCardComponent = (
  props: PiCardProps<InfoCardProps>,
): React.ReactNode => {
  const {
    title,
    description,
    actionCard,
    contentCard,
    footerCard,
    className,
    headerClassName,
    titleClassName,
    descriptionClassName,
    actionClassName,
    contentClassName,
    footerClassName,
    style,
    cardName,
  } = props;

  const hasHeader = title || description || actionCard;

  return (
    <Card
      className={cn("min-w-max", className)}
      style={style}
      data-pihanga={cardName}
    >
      {hasHeader && (
        // Plain <div> instead of shadcn <CardHeader> — avoids @container/card-header
        // (container-type:inline-size) which zeroes out intrinsic inline size and
        // breaks min-w-max on the parent Card. Visual classes are identical.
        <div
          data-slot="card-header"
          className={cn(
            "grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6",
            "has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
            headerClassName,
          )}
        >
          {title && <CardTitle className={titleClassName}>{title}</CardTitle>}
          {description && (
            <CardDescription className={descriptionClassName}>
              {description}
            </CardDescription>
          )}
          {actionCard && (
            <CardAction className={actionClassName}>
              <PiCard cardName={actionCard} parentCard={cardName} />
            </CardAction>
          )}
        </div>
      )}
      {contentCard && (
        <CardContent className={contentClassName}>
          <PiCard cardName={contentCard} parentCard={cardName} />
        </CardContent>
      )}
      {footerCard && (
        <CardFooter className={footerClassName}>
          <PiCard cardName={footerCard} parentCard={cardName} />
        </CardFooter>
      )}
    </Card>
  );
};
