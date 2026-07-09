import {definePlayground} from "@/playground/definePlayground";
import {ShadAvatar, type AvatarCardProps} from "./index";

export default definePlayground<AvatarCardProps>({
  cardId: "shad/avatar",
  title: "Avatar",

  preview: (props) => ShadAvatar(props),

  defaultProps: {
    src: "https://github.com/shadcn.png",
    alt: "shadcn",
    size: "md",
  },

  facets: [
    {
      id: "image",
      title: "With image",
      description:
        "Displays the avatar image when the URL resolves successfully.",
      props: {src: "https://github.com/shadcn.png", alt: "shadcn", size: "md"},
    },
    {
      id: "fallback",
      title: "Fallback initials",
      description:
        "When no image URL is provided the fallback initials are shown inside a muted circle.",
      props: {fallback: "JD", size: "md"},
    },
    {
      id: "sizes",
      title: "Large (xl)",
      description: "Use the size prop to control the avatar diameter.",
      props: {src: "https://github.com/shadcn.png", alt: "shadcn", size: "xl"},
    },
  ],

  controls: [
    {
      prop: "src",
      type: "text",
      label: "Image URL",
      placeholder: "https://…",
    },
    {
      prop: "alt",
      type: "text",
      label: "Alt text",
      placeholder: "User name",
    },
    {
      prop: "fallback",
      type: "text",
      label: "Fallback text",
      placeholder: "JD",
    },
    {
      prop: "size",
      type: "token",
      label: "Size",
      options: ["sm", "md", "lg", "xl"],
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. ring-2 ring-primary",
    },
  ],

  note: `
Inside \`app.pihanga.ts\`, a state-driven avatar looks like this:

\`\`\`ts
import {memo, registerCard} from "@pihanga2/core";
import {ShadAvatar} from "@/cards/avatar";
import type {AppState} from "@/app.state";

registerCard("myApp/userAvatar", ShadAvatar({
  src:      memo((s: AppState) => s.user.avatarUrl),
  fallback: memo((s: AppState) => s.user.initials),
  alt:      memo((s: AppState) => s.user.name),
  size:     "lg",
}));
\`\`\`
  `.trim(),
});
