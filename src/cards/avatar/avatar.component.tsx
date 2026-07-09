import * as React from "react";
import {type PiCardProps} from "@pihanga2/core";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {cn} from "@/lib/utils";
import type {AvatarCardProps, AvatarSize} from "./avatar.types";

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: "size-6 text-xs",
  md: "size-8 text-xs",
  lg: "size-12 text-sm",
  xl: "size-16 text-base",
};

/**
 * `shad/avatar` card component.
 *
 * Renders a shadcn `<Avatar>` with an optional image and a text fallback.
 * The avatar degrades gracefully: if `src` is absent or the image fails to
 * load, the `fallback` initials are shown inside a muted circle.
 */
export const AvatarComponent = (
  props: PiCardProps<AvatarCardProps>,
): React.ReactNode => {
  const {src, alt = "", fallback, size = "md", className, cardName} = props;

  return (
    <Avatar className={cn(SIZE_CLASS[size], className)} data-pihanga={cardName}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback>
        {fallback ?? alt.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};
