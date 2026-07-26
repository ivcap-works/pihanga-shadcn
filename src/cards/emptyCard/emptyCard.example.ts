import {definePlayground} from "@/playground/definePlayground";
import {EmptyCard} from "./index";
import type {EmptyCardProps} from "./emptyCard.types";

export default definePlayground<EmptyCardProps>({
  cardId: "empty-card",
  title: "Empty Card",

  preview: (props) => EmptyCard(props),

  defaultProps: {
    icon: "mountain-snow",
  },

  facets: [
    {
      id: "icon-only",
      title: "Icon only",
      description:
        "An empty-state placeholder with an icon and no content slot.",
      props: {icon: "mountain-snow"},
    },
    {
      id: "no-icon",
      title: "No icon",
      description: "Minimal empty state — no icon, no content.",
      props: {},
    },
  ],

  controls: [
    {
      prop: "icon",
      type: "text",
      label: "Icon name",
      placeholder: "e.g. mountain-snow",
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. border",
    },
  ],

  note: `
Register an icon and wire up a content card:

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {EmptyCard} from "@/cards/emptyCard";
import {Button} from "@/cards/button";
import {registerIcon} from "@/cards/icons";
import {Plus} from "lucide-react";

registerIcon("plus", Plus);

registerCard("myApp/createButton", Button({label: "Create new item"}));

registerCard("myApp/noResults", EmptyCard({
  icon: "plus",
  content: "myApp/createButton",
}));
\`\`\`
  `.trim(),
});
