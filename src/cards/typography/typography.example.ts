/**
 * Playground definition for the `shad/typography` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {Typography, type TypographyProps} from "./index";

export default definePlayground<TypographyProps>({
  cardId: "shad/typography",
  title: "Typography",

  preview: (props) => Typography(props),

  defaultProps: {
    text: "The quick brown fox jumps over the lazy dog.",
    level: "p",
  },

  facets: [
    {
      id: "h1",
      title: "H1",
      description: "Top-level page heading — use once per page.",
      props: {text: "Page Title", level: "h1"},
    },
    {
      id: "h2",
      title: "H2",
      description: "Major section heading.",
      props: {text: "Section Heading", level: "h2"},
    },
    {
      id: "h3",
      title: "H3",
      description: "Sub-section heading.",
      props: {text: "Sub-section", level: "h3"},
    },
    {
      id: "paragraph",
      title: "Paragraph",
      description: "Standard body text — the default level.",
      props: {
        text: "The quick brown fox jumps over the lazy dog.",
        level: "p",
      },
    },
    {
      id: "lead",
      title: "Lead",
      description:
        "Larger introductory paragraph — use below an H1 to set context.",
      props: {
        text: "An introductory sentence that sets the scene for the page.",
        level: "lead",
      },
    },
    {
      id: "muted",
      title: "Muted",
      description:
        "Small, muted-foreground text — ideal for captions and metadata.",
      props: {text: "Last updated 2 hours ago", level: "muted"},
    },
    {
      id: "code",
      title: "Code",
      description: "Inline monospaced code snippet.",
      props: {text: "npm install @pihanga2/core", level: "code"},
    },
    {
      id: "blockquote",
      title: "Blockquote",
      description: "Indented quotation block with a left border.",
      props: {
        text: "After all, everything is nothing, if you think too much about it.",
        level: "blockquote",
      },
    },
  ],

  controls: [
    {prop: "text", type: "text", label: "Text", placeholder: "Your text here…"},
    {
      prop: "level",
      type: "token",
      label: "Level",
      options: [
        "h1",
        "h2",
        "h3",
        "h4",
        "p",
        "lead",
        "large",
        "small",
        "muted",
        "blockquote",
        "code",
      ],
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. text-center",
    },
  ],

  note: `
Inside \`app.pihanga.ts\`, render state-driven text:

\`\`\`ts
import {memo, registerCard} from "@pihanga2/core";
import {Typography} from "@/cards/typography";
import type {AppState} from "@/app.state";

registerCard("myApp/pageTitle", Typography({
  level: "h1",
  text:  memo((s: AppState) => s.currentPage.title),
}));

registerCard("myApp/caption", Typography({
  level: "muted",
  text:  "Last updated just now",
}));
\`\`\`
  `.trim(),
});
