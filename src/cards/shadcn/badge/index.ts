import {type PiRegister, createCardDeclaration} from "@pihanga2/core";

import {BadgeComponent} from "./badge.component";
import {type BadgeProps} from "@pihanga2/cards";

export const badge_CARD = "shad/badge";
export const Sdbadge = createCardDeclaration<BadgeProps>(badge_CARD);

export function badgeInit(register: PiRegister): void {
  register.cardComponent({
    name: badge_CARD,
    component: BadgeComponent,
  });
}
