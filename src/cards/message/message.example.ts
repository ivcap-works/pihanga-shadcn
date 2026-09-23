import {registerCard} from "@pihanga2/core";
import {registerIcon} from "@/cards/icons";
import {CopyIcon, RefreshCcwIcon} from "lucide-react";
import {definePlayground} from "@/playground/definePlayground";
import {ShadAvatar} from "@/cards/avatar";
import {Bubble} from "@/cards/bubble";
import {Button} from "@/cards/button";
import {Stack} from "@/cards/stack";
import {Typography} from "@/cards/typography";
import {Message, type MessageProps} from "./index";

registerIcon("message-copy", CopyIcon);
registerIcon("message-retry", RefreshCcwIcon);

// ── Placeholder cards registered once at module load ─────────────────────
// Content mirrors the shadcn/ui docs "deploying to prod" conversation.
registerCard(
  "playground/message-avatar",
  ShadAvatar({src: "https://github.com/shadcn.png", alt: "shadcn", size: "md"}),
);
registerCard(
  "playground/message-bubble",
  Bubble({text: "It's 4:55 PM. On a Friday.", variant: "secondary"}),
);
registerCard(
  "playground/message-ghost-bubble",
  Bubble({
    variant: "ghost",
    text:
      "This is a *large* piece of content — in a real app, point `contentCard` at a `markdown-viewer` card instead of a plain bubble.",
  }),
);
registerCard(
  "playground/message-header",
  Typography({text: "Olivia", level: "small"}),
);
registerCard(
  "playground/message-footer",
  Typography({text: "Read · Yesterday", level: "muted"}),
);
registerCard(
  "playground/message-body",
  Bubble({
    text: "I already checked the logs. Send the report to the team. Ping @shadcn if you need help.",
    variant: "secondary",
  }),
);
registerCard(
  "playground/message-actions-bubble",
  Bubble({text: "Okay drop me a link.", variant: "ghost"}),
);
registerCard(
  "playground/message-actions-footer",
  Stack({
    direction: "row",
    spacing: 1,
    content: ["playground/message-copy-btn", "playground/message-retry-btn"],
  }),
);
registerCard(
  "playground/message-copy-btn",
  Button({
    ariaLabel: "Copy",
    iconLabel: "message-copy",
    opts: {variant: "ghost", size: "iconSm"},
  }),
);
registerCard(
  "playground/message-retry-btn",
  Button({
    ariaLabel: "Retry",
    iconLabel: "message-retry",
    opts: {variant: "ghost", size: "iconSm"},
  }),
);

export default definePlayground<MessageProps>({
  cardId: "shad/message",
  title: "Message",

  preview: (props) => Message(props),

  defaultProps: {
    avatarCard: "playground/message-avatar",
    contentCard: "playground/message-bubble",
  },

  facets: [
    {
      id: "basic",
      title: "Basic",
      description: "Avatar + bubble, aligned to the start (sender).",
      props: {
        avatarCard: "playground/message-avatar",
        contentCard: "playground/message-bubble",
      },
    },
    {
      id: "end-aligned",
      title: "End-aligned",
      description: "Current-user message, aligned to the right.",
      props: {
        align: "end",
        contentCard: "playground/message-bubble",
      },
    },
    {
      id: "header-footer",
      title: "Header & footer",
      description: "Sender name above, delivery status below.",
      props: {
        avatarCard: "playground/message-avatar",
        headerCard: "playground/message-header",
        contentCard: "playground/message-body",
        footerCard: "playground/message-footer",
      },
    },
    {
      id: "actions",
      title: "Actions",
      description:
        "Message-level actions (copy, retry) placed in the footer, aligned to the message side.",
      props: {
        avatarCard: "playground/message-avatar",
        contentCard: "playground/message-actions-bubble",
        footerCard: "playground/message-actions-footer",
      },
    },
    {
      id: "large-content",
      title: "Large content",
      description:
        "contentCard can be any card — here a ghost bubble stands in for a markdown-viewer card rendering rich, multi-paragraph output.",
      props: {
        avatarCard: "playground/message-avatar",
        contentCard: "playground/message-ghost-bubble",
      },
    },
  ],

  controls: [
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
      placeholder: "e.g. max-w-2xl",
    },
  ],

  note: `
Wire up a message row with an avatar, a bubble, and a footer:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {Message} from "@/cards/message";
import {ShadAvatar} from "@/cards/avatar";
import {Bubble} from "@/cards/bubble";
import {Typography} from "@/cards/typography";

registerCard("myApp/reply", Message({
  avatarCard: "myApp/avatar",
  contentCard: "myApp/replyBubble",
  footerCard: "myApp/replyFooter",
}));

registerCard("myApp/avatar", ShadAvatar({src: "https://github.com/shadcn.png"}));
registerCard("myApp/replyBubble", Bubble({text: "How can I help?"}));
registerCard("myApp/replyFooter", Typography({text: "Read", level: "muted"}));
\`\`\`

### Large content (markdown, tables, …)

\`contentCard\` accepts any Pihanga card — point it at a \`markdown-viewer\`
card (wrapped in a ghost \`shad/bubble\` for consistent framing) to render
rich assistant output:

\`\`\`ts
import {MarkdownViewer} from "@/cards/markdownViewer";

registerCard("myApp/assistantReply", Message({
  contentCard: "myApp/assistantBubble",
}));

registerCard("myApp/assistantBubble", Bubble({
  variant: "ghost",
  contentCard: "myApp/assistantMarkdown",
}));

registerCard("myApp/assistantMarkdown", MarkdownViewer({
  source: "# Result\\n\\nHere is your **answer**, with a table:\\n\\n| a | b |\\n|---|---|\\n| 1 | 2 |",
}));
\`\`\`

### Grouping consecutive messages

Use \`shad/message-group\` to stack messages from the same sender:

\`\`\`ts
import {MessageGroup} from "@/cards/message";

registerCard("myApp/thread", MessageGroup({
  content: ["myApp/msg1", "myApp/msg2"],
}));
\`\`\`

### Message-level actions

Place icon-only action buttons (copy, retry, feedback) in \`footerCard\`.
Give each one an \`ariaLabel\` since there's no visible text:

\`\`\`ts
import {Button} from "@/cards/button";
import {Stack} from "@/cards/stack";
import {registerIcon} from "@/cards/icons";
import {CopyIcon, RefreshCcwIcon} from "lucide-react";

registerIcon("copy", CopyIcon);
registerIcon("retry", RefreshCcwIcon);

registerCard("myApp/replyActions", Stack({
  direction: "row",
  spacing: 1,
  content: ["myApp/copyBtn", "myApp/retryBtn"],
}));

registerCard("myApp/copyBtn", Button({
  ariaLabel: "Copy",
  iconLabel: "copy",
  opts: {variant: "ghost", size: "iconSm"},
}));
\`\`\`
  `.trim(),
});
