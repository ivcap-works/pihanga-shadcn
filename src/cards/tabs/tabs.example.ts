import {definePlayground} from "@/playground/definePlayground";
import {Tabs, onTabsTabChanged, type TabsProps} from "./index";
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
const TAB_PROFILE = Typography({
  level: "p",
  text: "Edit your public profile information.",
});
const TAB_BILLING = Typography({
  level: "p",
  text: "Manage your billing details and invoices.",
});

export default definePlayground<TabsProps>({
  cardId: "shad/tabs",
  title: "Tabs",

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

  preview: (props) => Tabs(props),

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
    {
      id: "dropdown-overflow",
      title: "Dropdown overflow",
      description:
        "When tabs exceed maxTabs the tab strip is replaced by a Select drop-down. Here maxTabs=3 with 5 tabs forces the drop-down.",
      props: {
        selfManaged: true,
        maxTabs: 3,
        contentClassName: "mt-4",
        tabs: [
          {id: "account", title: "Account", contentCard: TAB_ACCOUNT},
          {id: "password", title: "Password", contentCard: TAB_PASSWORD},
          {
            id: "notifications",
            title: "Notifications",
            contentCard: TAB_NOTIFY,
          },
          {id: "profile", title: "Profile", contentCard: TAB_PROFILE},
          {id: "billing", title: "Billing", contentCard: TAB_BILLING},
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
      prop: "maxTabs",
      type: "number",
      label: "Max tabs (dropdown threshold)",
      placeholder: "e.g. 3",
    },
    {
      prop: "className",
      type: "text",
      label: "Root class",
      placeholder: "e.g. w-full",
    },
    {prop: "listClassName", type: "text", label: "List / trigger class"},
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
import {Tabs} from "@/cards/tabs";
import {Typography} from "@/cards/typography";

registerCard("myApp/tabs", Tabs({
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
import {Tabs, onTabsTabChanged} from "@/cards/tabs";
import type {AppState} from "@/app.state";

register((r) => {
  onTabsTabChanged(r, (state: AppState, {tabId}) => {
    state.activeTab = tabId;
  });
});

registerCard("myApp/tabs", Tabs({
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

**Dropdown overflow** — automatically switch to a \`<Select>\` when there are more than N tabs:

\`\`\`ts
registerCard("myApp/tabs", Tabs({
  selfManaged: true,
  // Tab strip for ≤ 3 tabs; Select drop-down for 4 or more.
  maxTabs: 3,
  tabs: [
    {id: "account",       title: "Account",       contentCard: "myApp/tab-account"},
    {id: "password",      title: "Password",      contentCard: "myApp/tab-password"},
    {id: "notifications", title: "Notifications", contentCard: "myApp/tab-notify"},
    {id: "profile",       title: "Profile",       contentCard: "myApp/tab-profile"},
    {id: "billing",       title: "Billing",       contentCard: "myApp/tab-billing"},
  ],
}));
\`\`\`
  `.trim(),
});
