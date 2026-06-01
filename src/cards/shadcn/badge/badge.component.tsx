import * as React from "react";
import clsx from "clsx";

import type {PiCardProps} from "@pihanga2/core";
import type {BadgeProps} from "@pihanga2/cards";
import {Badge} from "@/components/ui/badge";

export const BadgeComponent = (
  props: PiCardProps<BadgeProps>
): React.ReactNode => {
  const {label, variant, color, className, style, cardName, _cls} = props;

  const sy = (style?.shad || {}) as React.CSSProperties;

  let v: "default" | "outline" | "secondary" | "destructive" = "default";
  switch (variant) {
    case "outlined":
      v = "outline";
      break;
  }
  switch (color) {
    case "danger":
    case "warning":
      v = "destructive";
      break;
    case "secondary":
      v = "secondary";
      break;
  }

  return (
    <div
      className={clsx(_cls("root", cardName), className)}
      style={sy}
      data-pihanga={cardName}
    >
      <Badge variant={v}>{label}</Badge>
    </div>
  );
};
