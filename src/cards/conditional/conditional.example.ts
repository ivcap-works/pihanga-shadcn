/**
 * Playground definition for the `shad/conditional` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {ShadBadge} from "@/cards/badge";
import {Conditional, type ConditionalProps} from "./index";

export default definePlayground<ConditionalProps>({
  cardId: "shad/conditional",
  title: "Conditional",

  introduction: `
Renders a child card only when a boolean predicate is \`true\`.

Use \`shad/conditional\` to show or hide any card based on application state
without reaching for CSS \`hidden\` / \`display:none\` hacks.  The content card
is **mounted and unmounted** from the React tree — not just visually hidden —
so subscriptions, side-effects, and focus state inside it are fully reset when
the condition changes.  The card is a transparent pass-through: no extra DOM
wrapper is added.

| Prop | Purpose |
|---|---|
| \`show\` | Boolean gate; drive with \`memo()\` so the card reacts to state changes |
| \`content\` | The card to render when \`show\` is \`true\` |

Common use-cases: auth-gating a dashboard, showing an empty-state hint when
a list has no items, swapping an edit form in/out of a read-only view.
  `.trim(),

  // ── Preview factory ──────────────────────────────────────────────────────
  // `content` is always a fresh badge ref registered by the factory.
  // Only `show` is driven by the playground controls.
  preview: (props) =>
    Conditional({
      show: Boolean(props.show),
      content: ShadBadge({
        label: "✓  show is true — content is mounted",
        variant: "default",
      }),
    }),

  defaultProps: {
    show: true,
    // content is supplied by the preview factory; a placeholder is needed
    // here to satisfy the type but it is never rendered directly.
    content: "" as string,
  },

  // ── Facets ───────────────────────────────────────────────────────────────
  facets: [
    {
      id: "show-true",
      title: "show: true",
      description:
        "The `content` card is mounted and rendered in the React tree.",
      props: {show: true},
    },
    {
      id: "show-false",
      title: "show: false",
      description:
        "The `content` card is fully unmounted — no DOM node, no active subscriptions, no hidden element.",
      props: {show: false},
    },
  ],

  // ── Controls ─────────────────────────────────────────────────────────────
  controls: [
    {
      prop: "show",
      type: "boolean",
      label: "Show content",
    },
  ],

  note: `
Wire \`show\` to a \`memo()\` selector so the card responds to state changes:

\`\`\`ts
import {memo, registerCard} from "@pihanga2/core";
import {Conditional} from "@/cards/conditional";
import type {AppState} from "@/app.state";

// Show an empty-state hint only when the list has no items and is not loading.
registerCard("myApp/hint", Conditional({
  show:    memo((s: AppState) => s.services.length === 0 && !s.servicesLoading),
  content: "myApp/hintText",
}));

// Auth-gate a dashboard behind a login form.
registerCard("myApp/authGate", Conditional({
  show:    memo((s: AppState) => s.isLoggedIn),
  content: "myApp/dashboard",
}));
\`\`\`

**Why not \`className="hidden"\`?**

Toggling a Tailwind \`hidden\` class keeps the card mounted — its subscriptions,
timers, and focus state remain active even when invisible.  \`shad/conditional\`
fully unmounts the false branch so you get clean lifecycle semantics at no
extra boilerplate cost.
  `.trim(),
});
