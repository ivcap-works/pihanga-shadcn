import {definePlayground} from "@/playground/definePlayground";
import {SdTabs, onTabsTabChanged, type TabsProps} from "./index";
import {Typography} from "@/cards/typography";

// Shared placeholder content for preview tabs
const TAB_ACCOUNT = Typography({
  level: "p",
  text: "Manage your account settings here.",
});
const TAB_PASSWORD = Typography({
  level: "p",
  text: "Change your password and security settings.",
});
const TAB_NOTIFY = Typography({
  level: "p",
  text: "Configure your notification preferences.",
});

export default definePlayground<TabsProps>({
  cardId: "shad/tabs",
  title: "Tabs",

  introduction: `
Renders a horizontal (or vertical) tab strip backed by shadcn/ui's Tabs component.

**Modes:**

| Mode | \`selfManaged\` | Who controls the active tab? |
|---|---|---|
| Self-managed | \`true\` | Component internally — no reducer needed |
| Controlled | \`false\` (default) | Host app via \`value\` prop + reducer |

In **both** modes the \`onTabChanged\` event is dispatched whenever a tab is selected,
so external reducers can observe or override the active tab even in self-managed mode.

Each tab entry requires an \`id\`, a \`title\`, and a \`contentCard\` (\`PiCardRef\`).
  `.trim(),

  defaultProps: {
    selfManaged: true,
    tabs: [
      {
        id: "account",
        title: "Account",
        contentCard: "myApp/account-tab",
      },
      {
        id: "password",
        title: "Password",
        contentCard: "myApp/password-tab",
      },
      {
        id: "notifications",
        title: "Notifications",
        contentCard: "myApp/notifications-tab",
        disabled: true,
      },
    ],
  },

  preview: (props) => SdTabs(props),

  facets: [
    {
      id: "self-managed",
      title: "Self-managed",
      description:
        "Component tracks its own active tab. No reducer required. onTabChanged still fires.",
      props: {
        selfManaged: true,
        tabs: [
          {id: "account", title: "Account", contentCard: TAB_ACCOUNT},
          {id: "password", title: "Password", contentCard: TAB_PASSWORD},
        ],
      },
    },
    {
      id: "controlled",
      title: "Controlled",
      description:
        "Active tab is driven by `value` from app state. Wire a reducer to onTabChanged.",
      props: {
        selfManaged: false,
        value: "account",
        tabs: [
          {id: "account", title: "Account", contentCard: TAB_ACCOUNT},
          {id: "password", title: "Password", contentCard: TAB_PASSWORD},
        ],
      },
    },
    {
      id: "vertical",
      title: "Vertical",
      description: "Vertical layout — tab triggers stack on the left.",
      props: {
        selfManaged: true,
        orientation: "vertical",
        tabs: [
          {id: "account", title: "Account", contentCard: TAB_ACCOUNT},
          {id: "password", title: "Password", contentCard: TAB_PASSWORD},
          {
            id: "notifications",
            title: "Notifications",
            contentCard: TAB_NOTIFY,
          },
        ],
      },
    },
    {
      id: "custom-classes",
      title: "Custom classes",
      description: "Custom className props for fine-grained layout control.",
      props: {
        selfManaged: true,
        className: "w-full",
        listClassName: "grid w-full grid-cols-3",
        contentClassName: "mt-4 rounded-md border p-4",
        tabs: [
          {id: "account", title: "Account", contentCard: TAB_ACCOUNT},
          {id: "password", title: "Password", contentCard: TAB_PASSWORD},
          {
            id: "notifications",
            title: "Notifications",
            contentCard: TAB_NOTIFY,
          },
        ],
      },
    },
  ],

  controls: [
    {prop: "selfManaged", type: "boolean", label: "Self-managed"},
    {
      prop: "orientation",
      type: "token",
      label: "Orientation",
      options: ["horizontal", "vertical"],
    },
    {
      prop: "className",
      type: "text",
      label: "Root class",
      placeholder: "e.g. w-full",
    },
    {prop: "listClassName", type: "text", label: "List class"},
    {prop: "contentClassName", type: "text", label: "Content class"},
  ],

  registerEvents: (r, logEvent) => {
    // Fires whenever the user switches to a different tab in the live preview.
    onTabsTabChanged(r, (state, ev) => {
      logEvent(state, "onTabsTabChanged", {tabId: ev.tabId});
    });
  },

  note: `
**Self-managed** — no reducer needed:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {SdTabs} from "@/cards/tabs";
import {Typography} from "@/cards/typography";

registerCard("myApp/tabs", SdTabs({
  selfManaged: true,
  tabs: [
    {
      id:          "account",
      title:       "Account",
      contentCard: Typography({level: "p", text: "Manage account settings."}),
    },
    {
      id:          "password",
      title:       "Password",
      contentCard: Typography({level: "p", text: "Change your password here."}),
    },
  ],
}));
\`\`\`

**Controlled** — active tab driven by state:

\`\`\`ts
import {registerCard, memo, register} from "@pihanga2/core";
import {SdTabs, onTabsTabChanged} from "@/cards/tabs";
import type {AppState} from "@/app.state";

register((r) => {
  onTabsTabChanged(r, (state: AppState, {tabId}) => {
    state.activeTab = tabId;
  });
});

registerCard("myApp/tabs", SdTabs({
  value: memo(
    (s: AppState) => s.activeTab,
    (v) => v ?? "account",
  ),
  tabs: [
    {id: "account",  title: "Account",  contentCard: "myApp/tab-account"},
    {id: "password", title: "Password", contentCard: "myApp/tab-password"},
  ],
}));
\`\`\`
  `.trim(),
});
