import {createCardDeclaration} from "@pihanga2/core";
import type React from "react";

export const ICON_CARD = "shad/icon";

export type IconCardProps = {
  /** Name of the icon as registered via `registerIcon` */
  iconName: string;

  /** Props forwarded to the icon element (e.g. size, strokeWidth) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  iconProps?: Record<string, any>;

  /** Additional Tailwind classes applied to the wrapping `<div>` */
  className?: string;

  /** Inline styles applied to the wrapping `<div>` */
  style?: React.CSSProperties;
};

/**
 * Factory function for declaring a `shad/icon` card instance.
 *
 * ```ts
 * import {registerCard} from "@pihanga2/core";
 * import {ShadIcon} from "@/cards/iconCard";
 *
 * registerCard("myApp/saveIcon", ShadIcon({iconName: "save", className: "text-primary"}));
 * ```
 */
export const ShadIcon = createCardDeclaration<IconCardProps>(ICON_CARD);
