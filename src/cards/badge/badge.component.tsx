import * as React from "react";
import {type PiCardProps} from "@pihanga2/core";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import type {BadgeCardProps} from "./badge.types";

/**
 * `shad/badge` card component.
 *
 * Renders a shadcn `<Badge>` element with a `label` and an optional `variant`.
 * The variant vocabulary is intentionally identical to the `BadgeColumn.variants`
 * map used by the `shad/data-table` card, so both can be driven from the same
 * source-of-truth value:
 *
 *   "default" | "secondary" | "destructive" | "outline"
 */
export const BadgeComponent = (
  props: PiCardProps<BadgeCardProps>,
): React.ReactNode => {
  const {label, variant = "secondary", className, cardName} = props;

  return (
    <Badge
      variant={variant}
      className={cn(className)}
      data-pihanga={cardName}
    >
      {label}
    </Badge>
  );
};
