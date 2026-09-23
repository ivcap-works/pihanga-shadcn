import * as React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {Bubble, BubbleContent, BubbleReactions} from "@/components/ui/bubble";
import {cn} from "@/lib/utils";
import type {BubbleEvents, BubbleProps} from "./bubble.types";

export const BubbleComponent = (
  props: PiCardProps<BubbleProps, BubbleEvents>,
): React.ReactNode => {
  const {
    id,
    text,
    contentCard,
    variant = "default",
    align = "start",
    href,
    target,
    clickable,
    reactions,
    reactionsCard,
    reactionsAriaLabel,
    reactionsSide = "bottom",
    reactionsAlign = "end",
    className,
    contentClassName,
    reactionsClassName,
    style,
    cardName,
    onClicked,
  } = props;

  const innerContent = contentCard ? (
    <Card cardName={contentCard} parentCard={cardName} />
  ) : (
    text
  );

  return (
    <Bubble
      variant={variant}
      align={align}
      className={className}
      style={style}
      data-pihanga={cardName}
    >
      {href ? (
        <BubbleContent asChild className={contentClassName}>
          <a href={href} target={target}>
            {innerContent}
          </a>
        </BubbleContent>
      ) : clickable ? (
        <BubbleContent asChild className={contentClassName}>
          <button type="button" onClick={() => onClicked({id})}>
            {innerContent}
          </button>
        </BubbleContent>
      ) : (
        <BubbleContent className={contentClassName}>
          {innerContent}
        </BubbleContent>
      )}

      {reactionsCard ? (
        <BubbleReactions
          side={reactionsSide}
          align={reactionsAlign}
          className={reactionsClassName}
          {...(reactionsAriaLabel
            ? {role: "img", "aria-label": reactionsAriaLabel}
            : {})}
        >
          <Card cardName={reactionsCard} parentCard={cardName} />
        </BubbleReactions>
      ) : (
        reactions &&
        reactions.length > 0 && (
          <BubbleReactions
            side={reactionsSide}
            align={reactionsAlign}
            className={reactionsClassName}
            {...(reactionsAriaLabel
              ? {role: "img", "aria-label": reactionsAriaLabel}
              : {})}
          >
            {reactions.map((r, i) => (
              <span key={i} className={cn("inline-flex")}>
                {r}
              </span>
            ))}
          </BubbleReactions>
        )
      )}
    </Bubble>
  );
};
