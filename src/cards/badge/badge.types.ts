import {createCardDeclaration} from "@pihanga2/core";

export const BADGE_CARD = "shad/badge";

/**
 * Badge visual style variants — mirrors the shadcn `Badge` `variant` prop and
 * the `variants` map used in the dataTable `BadgeColumn` type, so the same
 * string values work in both contexts.
 *
 * | Value           | Appearance                               |
 * |-----------------|------------------------------------------|
 * | `"default"`     | Primary colour, filled                   |
 * | `"secondary"`   | Muted/secondary colour, filled (default) |
 * | `"destructive"` | Red / error colour, filled               |
 * | `"outline"`     | Transparent background, border only      |
 */
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export type BadgeCardProps = {
  /** Text content rendered inside the badge */
  label: string;

  /**
   * Visual style variant.  Matches the shadcn Badge variants and the
   * `BadgeColumn.variants` map in `dataTable.types.ts`.
   * @default "secondary"
   */
  variant?: BadgeVariant;

  /** Additional Tailwind classes applied to the `<Badge>` element */
  className?: string;
};

/**
 * Factory function for declaring a `shad/badge` card instance.
 *
 * ```ts
 * import {registerCard} from "@pihanga2/core";
 * import {ShadBadge} from "@/cards/badge";
 *
 * registerCard("myApp/status", ShadBadge({label: "Active", variant: "default"}));
 * ```
 */
export const ShadBadge = createCardDeclaration<BadgeCardProps>(BADGE_CARD);
