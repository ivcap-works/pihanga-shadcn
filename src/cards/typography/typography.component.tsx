import * as React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {cn} from "@/lib/utils";
import type {TypographyLevel, TypographyProps} from "./typography.types";

/** Maps each level to [html element, tailwind classes] */
const LEVEL_CONFIG: Record<
  TypographyLevel,
  [keyof React.JSX.IntrinsicElements, string]
> = {
  h1: ["h1", "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"],
  h2: [
    "h2",
    "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
  ],
  h3: ["h3", "scroll-m-20 text-2xl font-semibold tracking-tight"],
  h4: ["h4", "scroll-m-20 text-xl font-semibold tracking-tight"],
  p: ["p", "leading-7 [&:not(:first-child)]:mt-6"],
  blockquote: ["blockquote", "mt-6 border-l-2 pl-6 italic"],
  code: [
    "code",
    "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
  ],
  lead: ["p", "text-xl text-muted-foreground"],
  large: ["div", "text-lg font-semibold"],
  small: ["small", "text-sm font-medium leading-none"],
  muted: ["p", "text-sm text-muted-foreground"],
};

export const TypographyComponent = (
  props: PiCardProps<TypographyProps>,
): React.ReactNode => {
  const {
    text,
    childCard,
    paragraph,
    level,
    className,
    style,
    cardName,
    _dispatch,
    _cls,
  } = props;

  const [el, levelClass] = level ? LEVEL_CONFIG[level] : ["div", ""];

  function renderChildren(): React.ReactNode {
    if (childCard) {
      return <Card cardName={childCard} parentCard={cardName} />;
    }
    if (paragraph) {
      return <>{paragraph.map((item, i) => renderParaItem(item, i))}</>;
    }
    return text;
  }

  function renderParaItem(
    item: string | TypographyProps,
    key: number,
  ): React.ReactNode {
    if (typeof item === "string") {
      return item;
    }
    if (item && typeof item === "object") {
      return TypographyComponent({
        ...item,
        _dispatch,
        _cls,
        cardName,
        key,
      } as PiCardProps<TypographyProps> & {key: number});
    }
    return null;
  }

  return React.createElement(
    el,
    {
      className: cn(levelClass, className),
      style,
      "data-pihanga": cardName,
    },
    renderChildren(),
  );
};
