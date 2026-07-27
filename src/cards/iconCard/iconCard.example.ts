import {definePlayground} from "@/playground/definePlayground";
import {ShadIcon, type IconCardProps} from "./index";

export default definePlayground<IconCardProps>({
  cardId: "shad/icon",
  title: "Icon",

  preview: (props) => ShadIcon(props),

  defaultProps: {
    iconName: "save",
  },

  facets: [
    {
      id: "basic",
      title: "Basic",
      description: "Renders a named icon from the icon registry.",
      props: {iconName: "save"},
    },
    {
      id: "styled",
      title: "Styled wrapper",
      description: "Icon inside a div with Tailwind classes and inline style.",
      props: {
        iconName: "user",
        className: "flex items-center justify-center rounded-full bg-muted",
        style: {width: 48, height: 48},
      },
    },
  ],

  controls: [
    {
      prop: "iconName",
      type: "text",
      label: "Icon name",
      placeholder: "e.g. save, user, down",
    },
    {
      prop: "className",
      type: "text",
      label: "Wrapper className",
      placeholder: "e.g. text-primary p-2",
    },
  ],

  note: `
Register icons once in \`app.icons.ts\`, then reference them by name:

\`\`\`ts
import {registerIcon} from "@/cards/icons";
import {Save} from "lucide-react";

registerIcon("save", Save);
\`\`\`

Then declare the card:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {ShadIcon} from "@/cards/iconCard";

registerCard("myApp/saveIcon", ShadIcon({
  iconName: "save",
  className: "text-primary",
  style: {width: 32, height: 32},
}));
\`\`\`
  `.trim(),
});
