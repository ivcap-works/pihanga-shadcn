/**
 * Playground definition for the `shad/badge` card.
 *
 * This file is the **canonical example** for how to author a `PlaygroundDef`.
 * See `src/playground/PLAYGROUND_PLAN.md` for the full specification.
 *
 * Key rules:
 *  - Default export is a `PlaygroundDef` (consumed by the playground engine).
 *  - `defaultProps` contains only plain, JSON-serialisable values.
 *  - No `memo()` / `register()` calls here — those belong in `app.pihanga.ts`.
 *  - `controls` mirrors the card's public Props type.
 *  - `facets` replace the old TSDoc `## Example N` comment blocks.
 */
import {definePlayground} from "@/playground/definePlayground";
import {ShadBadge, type BadgeCardProps} from "./index";

export default definePlayground<BadgeCardProps>({
  cardId: "shad/badge",
  title: "Badge",

  introduction: `
Badges are compact status descriptors attached to UI elements.
Use them to communicate the state of an item — its lifecycle phase,
category, or importance — at a glance.

The four built-in variants map directly to the \`BadgeColumn.variants\` map
in \`shad/data-table\`, so a badge card and a table badge column can always
be kept in sync without a translation layer.

When the badge label or variant needs to react to application state, wrap
the prop in \`memo()\` inside \`app.pihanga.ts\` — keep example files
data-only.
  `.trim(),

  preview: (props) => ShadBadge(props),

  defaultProps: {
    label: "New",
    variant: "default",
  },

  facets: [
    {
      id: "default",
      title: "Default",
      description:
        "Primary colour, filled. Use for the most prominent or active state.",
      props: {label: "New", variant: "default"},
    },
    {
      id: "secondary",
      title: "Secondary",
      description:
        "Muted / secondary fill — the fallback when `variant` is omitted.",
      props: {label: "Draft", variant: "secondary"},
    },
    {
      id: "destructive",
      title: "Destructive",
      description:
        "Red / error colour. Use for failed, blocked, or dangerous states.",
      props: {label: "Error", variant: "destructive"},
    },
    {
      id: "outline",
      title: "Outline",
      description: "Transparent background with a border only.",
      props: {label: "Pending", variant: "outline"},
    },
  ],

  controls: [
    {
      prop: "variant",
      type: "token",
      label: "Variant",
      options: ["default", "secondary", "destructive", "outline"],
    },
    {
      prop: "label",
      type: "text",
      label: "Label",
      placeholder: "Badge text…",
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. uppercase tracking-wide",
    },
  ],

  note: `
Inside \`app.pihanga.ts\`, a state-driven badge looks like this:

\`\`\`ts
import {memo, registerCard} from "@pihanga2/core";
import {ShadBadge, type BadgeVariant} from "@/cards/badge";
import type {AppState} from "@/app.state";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  active:   "default",
  draft:    "secondary",
  error:    "destructive",
  archived: "outline",
};

registerCard("myApp/jobStatus", ShadBadge({
  label:   memo((s: AppState) => s.job.status),
  variant: memo(
    (s: AppState) => s.job.status,
    (status) => STATUS_VARIANT[status] ?? "secondary",
  ),
}));
\`\`\`
  `.trim(),
});
