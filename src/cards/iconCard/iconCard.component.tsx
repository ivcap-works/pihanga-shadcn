import React from "react";
import {type PiCardProps} from "@pihanga2/core";
import {cn} from "@/lib/utils";
import {getIcon} from "@/cards/icons";
import type {IconCardProps} from "./iconCard.types";

/**
 * `shad/icon` card component.
 *
 * Renders a named icon (resolved via the pihanga icon registry) inside a
 * plain `<div>`.  The wrapping div accepts an optional `className` for
 * Tailwind utilities and an optional `style` for inline CSS overrides.
 */
export const IconCardComponent = (
  props: PiCardProps<IconCardProps>,
): React.ReactNode => {
  const {iconName, iconProps, className, style, cardName} = props;

  return (
    <div className={cn(className)} style={style} data-pihanga={cardName}>
      {getIcon(iconName, iconProps)}
    </div>
  );
};
