import {definePlayground} from "@/playground/definePlayground";
import {Bubble, onBubbleClicked, type BubbleProps} from "./index";

export default definePlayground<BubbleProps>({
  cardId: "shad/bubble",
  title: "Bubble",

  preview: (props) => Bubble(props),

  defaultProps: {
    text: "How can I help you today?",
    variant: "default",
    align: "start",
  },

  facets: [
    {
      id: "default",
      title: "Default",
      description: "Strong primary-coloured bubble — usually for the current user.",
      props: {text: "It's a one-line change.", variant: "default", align: "end"},
    },
    {
      id: "secondary",
      title: "Secondary",
      description: "The standard neutral bubble for conversation content.",
      props: {text: "It's always a one-line change 😭.", variant: "secondary"},
    },
    {
      id: "muted",
      title: "Muted",
      description: "A lower-emphasis bubble for quiet supporting content.",
      props: {text: "Oliver is typing...", variant: "muted"},
    },
    {
      id: "tinted",
      title: "Tinted",
      description: "A subtle primary-tinted bubble.",
      props: {text: "This one is tinted — a softer color derived from the primary color.", variant: "tinted"},
    },
    {
      id: "outline",
      title: "Outline",
      description: "A bordered bubble for secondary or rich content.",
      props: {text: "We can also use an outlined variant.", variant: "outline"},
    },
    {
      id: "ghost",
      title: "Ghost (large content)",
      description:
        "Unframed — ideal for assistant text, markdown, and other rich content that should take the full width. Pair with contentCard for a markdown-viewer card.",
      props: {
        text: "Ghost bubbles work for assistant text, markdown, and other content that should not be framed.",
        variant: "ghost",
      },
    },
    {
      id: "destructive",
      title: "Destructive",
      description: "A destructive bubble for error or failed actions.",
      props: {text: "Failed to run the command.", variant: "destructive"},
    },
    {
      id: "clickable",
      title: "Clickable",
      description:
        "Rendered as a real <button> so it's focusable and fires onClicked.",
      props: {
        id: "reply",
        text: "I forgot my password",
        variant: "muted",
        align: "end",
        clickable: true,
      },
    },
    {
      id: "reactions",
      title: "With reactions",
      description: "Reactions anchor to the bubble edge, overlapping the border.",
      props: {
        text: "Sure. Hit me with your best demo.",
        variant: "secondary",
        reactions: ["👍", "🔥", "+2"],
        reactionsAriaLabel: "Reactions: thumbs up, fire, and 2 more",
      },
    },
  ],

  controls: [
    {prop: "text", type: "text", label: "Text", placeholder: "Message text…"},
    {
      prop: "variant",
      type: "token",
      label: "Variant",
      options: [
        "default",
        "secondary",
        "muted",
        "tinted",
        "outline",
        "ghost",
        "destructive",
      ],
    },
    {
      prop: "align",
      type: "token",
      label: "Align",
      options: ["start", "end"],
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. max-w-md",
    },
  ],

  registerEvents: (r, logEvent) => {
    onBubbleClicked(r, (state, ev) => {
      logEvent(state, "onBubbleClicked", {id: ev.id});
    });
  },

  note: `
Render "large" content (e.g. rendered Markdown) inside a bubble by pointing
\`contentCard\` at a \`markdown-viewer\` card and using \`variant: "ghost"\`
so it isn't framed:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {Bubble} from "@/cards/bubble";
import {MarkdownViewer} from "@/cards/markdownViewer";

registerCard("myApp/assistantReply", Bubble({
  variant: "ghost",
  contentCard: "myApp/assistantMarkdown",
}));

registerCard("myApp/assistantMarkdown", MarkdownViewer({
  source: "# Result\\n\\nHere is your **answer**.",
}));
\`\`\`
  `.trim(),
});
