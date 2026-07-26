import {registerCard} from "@pihanga2/core";
import {definePlayground} from "@/playground/definePlayground";
import {Typography} from "@/cards/typography";
import {InfoCard, type InfoCardProps} from "./index";

// ── Placeholder content cards registered once at module load ─────────────────
registerCard(
  "playground/info-content",
  Typography({
    text: "This is the main content area. Wire up any Pihanga card here — a form, a list, a chart, or a layout card.",
    level: "p",
  }),
);
registerCard(
  "playground/info-footer",
  Typography({text: "Last updated 2 hours ago", level: "muted"}),
);
registerCard(
  "playground/info-action",
  Typography({text: "Action", level: "small"}),
);

export default definePlayground<InfoCardProps>({
  cardId: "shad/info-card",
  title: "Info Card",

  introduction: `
A structural card built on the shadcn \`Card\` primitives.

All five slots are optional and independently styled:

| Prop | Slot | Description |
|---|---|---|
| \`title\` | \`CardTitle\` | Bold header text. |
| \`description\` | \`CardDescription\` | Muted sub-header text. |
| \`actionCard\` | \`CardAction\` | Top-right header slot — badge, button, icon, etc. |
| \`contentCard\` | \`CardContent\` | Main body — any Pihanga card. |
| \`footerCard\` | \`CardFooter\` | Bottom row — actions, metadata, pagination. |

Every slot has a dedicated \`*ClassName\` prop so you can target individual
elements without overriding the component entirely.
  `.trim(),

  preview: (props) => InfoCard(props),

  defaultProps: {
    title: "Total Revenue",
    description: "Monthly summary",
    contentCard: "playground/info-content",
    footerCard: "playground/info-footer",
  },

  facets: [
    {
      id: "title-only",
      title: "Title only",
      description:
        "Minimal card — title and description, no content or footer.",
      props: {
        title: "Total Revenue",
        description: "Monthly summary",
        contentCard: undefined,
        footerCard: undefined,
      },
    },
    {
      id: "with-content",
      title: "With content",
      description: "Header + body content card.",
      props: {
        title: "Active Users",
        description: undefined,
        contentCard: "playground/info-content",
        footerCard: undefined,
      },
    },
    {
      id: "full",
      title: "Full",
      description: "All slots populated — header, action, content, and footer.",
      props: {
        title: "Dashboard",
        description: "Overview",
        actionCard: "playground/info-action",
        contentCard: "playground/info-content",
        footerCard: "playground/info-footer",
      },
    },
    {
      id: "styled",
      title: "Styled",
      description: "Custom classes on every slot for fine-grained control.",
      props: {
        title: "Styled Card",
        description: "Per-slot class overrides",
        actionCard: "playground/info-action",
        contentCard: "playground/info-content",
        footerCard: "playground/info-footer",
        className: "max-w-sm",
        headerClassName: "border-b",
        titleClassName: "text-primary",
        descriptionClassName: "text-xs",
        contentClassName: "pt-4",
        footerClassName: "border-t justify-end",
      },
    },
  ],

  controls: [
    {
      prop: "title",
      type: "text",
      label: "Title",
      placeholder: "e.g. Total Revenue",
    },
    {
      prop: "description",
      type: "text",
      label: "Description",
      placeholder: "e.g. Monthly summary",
    },
    {
      prop: "className",
      type: "text",
      label: "Card classes",
      placeholder: "e.g. max-w-sm",
    },
    {
      prop: "headerClassName",
      type: "text",
      label: "Header classes",
      placeholder: "e.g. border-b",
    },
    {
      prop: "titleClassName",
      type: "text",
      label: "Title classes",
      placeholder: "e.g. text-primary",
    },
    {
      prop: "descriptionClassName",
      type: "text",
      label: "Description classes",
      placeholder: "e.g. text-xs",
    },
    {
      prop: "contentClassName",
      type: "text",
      label: "Content classes",
      placeholder: "e.g. pt-4",
    },
    {
      prop: "footerClassName",
      type: "text",
      label: "Footer classes",
      placeholder: "e.g. border-t justify-end",
    },
  ],

  note: `
\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {InfoCard} from "@/cards/infoCard";
import {Typography} from "@/cards/typography";
import {Button} from "@/cards/button";

registerCard("myApp/revenueCard", InfoCard({
  title: "Total Revenue",
  description: "Last 30 days",
  actionCard: "myApp/viewDetailsButton",
  contentCard: "myApp/revenueChart",
  footerCard: "myApp/revenueFooter",
  className: "max-w-sm",
  footerClassName: "justify-end",
}));

registerCard("myApp/viewDetailsButton", Button({label: "View details"}));

registerCard("myApp/revenueFooter", Typography({
  text: "Updated just now",
  level: "muted",
}));
\`\`\`
  `.trim(),
});
