import {registerCard} from "@pihanga2/core";
import {definePlayground} from "@/playground/definePlayground";
import {EmptyCard} from "@/cards/emptyCard";
import {
  CollapsibleCard,
  onCollapsibleCardOpenChanged,
  type CollapsibleCardProps,
} from "./index";

// Register a placeholder content card used in every playground facet preview.
// The "mountain-snow" icon is already registered in src/app.icons.ts.
const CONTENT_CARD = "playground/collapsible-content";
registerCard(CONTENT_CARD, EmptyCard({icon: "mountain-snow"}));

export default definePlayground<CollapsibleCardProps>({
  cardId: "shad/collapsible",
  title: "Collapsible Card",

  introduction: `
A collapsible panel with a typed Typography title, an optional trigger icon, and
a Pihanga card content slot.

- **\`title\`** / **\`titleLevel\`** — built-in text header styled as a
  Typography element (h1–h4, p, lead, large, small, muted).
- **\`titleCard\`** — swap the header for any Pihanga card (overrides \`title\`).
- **\`icon\`** — icon name from the Pihanga icon registry; defaults to the
  \`ChevronsUpDown\` lucide icon.
- **\`contentCard\`** — any Pihanga card rendered inside the collapsible body.
- **\`defaultOpen\`** / **\`open\`** — uncontrolled or controlled open state.
- **\`className\`**, **\`headerClassName\`**, **\`contentClassName\`** — per-zone
  Tailwind class overrides.
  `.trim(),

  preview: (props) => CollapsibleCard(props),

  defaultProps: {
    title: "Starred Repositories",
    titleLevel: "h4",
    defaultOpen: false,
    contentCard: CONTENT_CARD,
  },

  facets: [
    {
      id: "closed",
      title: "Closed",
      description: "Default state — panel is collapsed on mount.",
      props: {
        title: "Starred Repositories",
        titleLevel: "h4",
        defaultOpen: false,
        contentCard: CONTENT_CARD,
      },
    },
    {
      id: "open",
      title: "Open",
      description: "Panel starts expanded.",
      props: {
        title: "Starred Repositories",
        titleLevel: "h4",
        defaultOpen: true,
        contentCard: CONTENT_CARD,
      },
    },
    {
      id: "custom-title-level",
      title: "Lead title",
      description: "Render the header as a muted lead paragraph.",
      props: {
        title: "Optional section",
        titleLevel: "lead",
        defaultOpen: true,
        contentCard: CONTENT_CARD,
      },
    },
    {
      id: "styled",
      title: "Styled",
      description: "Custom classes on root, header row, and content area.",
      props: {
        title: "Advanced options",
        titleLevel: "h4",
        defaultOpen: true,
        contentCard: CONTENT_CARD,
        className: "rounded-md border px-4",
        headerClassName: "border-b",
        contentClassName: "p-4",
      },
    },
  ],

  controls: [
    {
      prop: "title",
      type: "text",
      label: "Title text",
      placeholder: "e.g. Starred Repositories",
    },
    {
      prop: "titleLevel",
      type: "token",
      label: "Title level",
      options: ["h4", "p", "lead", "muted"],
    },
    {
      prop: "defaultOpen",
      type: "boolean",
      label: "Default open",
    },
    {
      prop: "icon",
      type: "text",
      label: "Icon name",
      placeholder: "e.g. chevron-down (leave blank for default)",
    },
    {
      prop: "className",
      type: "text",
      label: "Root classes",
      placeholder: "e.g. rounded-md border px-4",
    },
    {
      prop: "headerClassName",
      type: "text",
      label: "Header classes",
      placeholder: "e.g. border-b",
    },
    {
      prop: "contentClassName",
      type: "text",
      label: "Content classes",
      placeholder: "e.g. p-4",
    },
  ],

  registerEvents: (r, logEvent) => {
    onCollapsibleCardOpenChanged(r, (state, ev) => {
      logEvent(state, "onOpenChanged", {open: ev.open});
    });
  },

  note: `
Wire up a collapsible panel with a body card:

\`\`\`ts
import {register, registerCard} from "@pihanga2/core";
import {CollapsibleCard, onCollapsibleCardOpenChanged} from "@/cards/collapsibleCard";
import {Typography} from "@/cards/typography";

registerCard("myApp/settings", CollapsibleCard({
  title: "Advanced options",
  titleLevel: "h4",
  contentCard: "myApp/settingsBody",
  className: "rounded-md border px-4",
  contentClassName: "pb-4",
}));

registerCard("myApp/settingsBody", Typography({
  text: "Hidden settings revealed when the panel is open.",
  level: "p",
}));

// Optional: react to open/close changes
register((r) => {
  onCollapsibleCardOpenChanged(r, (state, {open}) => {
    state.settingsOpen = open;
  });
});
\`\`\`

### Controlled mode

Pass \`open\` from state and update it via the event handler:

\`\`\`ts
import {memo} from "@pihanga2/core";
import type {AppState} from "@/app.state";

registerCard("myApp/settings", CollapsibleCard({
  title: "Advanced options",
  open: memo((s: AppState) => s.settingsOpen),
  contentCard: "myApp/settingsBody",
}));
\`\`\`

### Custom title card

Replace the built-in Typography header with any Pihanga card:

\`\`\`ts
import {Badge} from "@/cards/badge";

registerCard("myApp/badgeTitle", Badge({label: "Beta", variant: "secondary"}));

registerCard("myApp/betaPanel", CollapsibleCard({
  titleCard: "myApp/badgeTitle",
  contentCard: "myApp/betaBody",
}));
\`\`\`
  `.trim(),
});
