/**
 * Playground definition for the `shad/conditional` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {ShadBadge} from "@/cards/badge";
import {Conditional, type ConditionalProps} from "./index";

export default definePlayground<ConditionalProps>({
  cardId: "shad/conditional",
  title: "Conditional",

  // ── Preview factory ──────────────────────────────────────────────────────
  preview: (props) =>
    Conditional({
      show: props.show !== undefined ? Boolean(props.show) : undefined,
      // "none" is the sentinel for "no breakpoint restriction"
      showOn:
        !props.showOn || (props.showOn as string) === "none"
          ? undefined
          : (props.showOn as string),
      containerQuery: Boolean(props.containerQuery),
      content: ShadBadge({
        label: "✓  visibility condition met — content is mounted",
        variant: "default",
      }),
    }),

  defaultProps: {
    show: true,
    showOn: "none",
    containerQuery: false,
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
    {
      id: "show-on-md",
      title: "showOn: 'md' (viewport)",
      description:
        "Mounts content only when the **viewport** is ≥ 768 px wide (Tailwind `md`). Resize the window to see live mount/unmount.",
      props: {showOn: "md", containerQuery: false},
    },
    {
      id: "show-on-lg",
      title: "showOn: 'lg' (viewport)",
      description:
        "Mounts content only when the **viewport** is ≥ 1024 px wide (Tailwind `lg`).",
      props: {showOn: "lg", containerQuery: false},
    },
    {
      id: "show-on-custom-min",
      title: "showOn: '>400px'",
      description:
        "Mounts content only when the viewport is wider than 400 px (custom exclusive min-width).",
      props: {showOn: ">400px", containerQuery: false},
    },
    {
      id: "show-on-custom-max",
      title: "showOn: '<768px'",
      description:
        "Mounts content only when the viewport is narrower than 768 px (mobile-only content).",
      props: {showOn: "<768px", containerQuery: false},
    },
    {
      id: "container-md",
      title: "containerQuery: md",
      description:
        "Mounts content only when the **enclosing container** is ≥ 768 px wide. Evaluates the selector against the card's own rendered width via `ResizeObserver` — not the viewport.",
      props: {showOn: "md", containerQuery: true},
    },
    {
      id: "container-custom",
      title: "containerQuery: >400px",
      description:
        "Mounts content only when the **enclosing container** is wider than 400 px.",
      props: {showOn: ">400px", containerQuery: true},
    },
    {
      id: "combined",
      title: "show + showOn (AND)",
      description:
        "Both conditions must be satisfied: `show` is `true` **and** viewport ≥ 768 px.",
      props: {show: true, showOn: "md"},
    },
  ],

  // ── Controls ─────────────────────────────────────────────────────────────
  controls: [
    {
      prop: "show",
      type: "boolean",
      label: "show",
    },
    {
      prop: "showOn",
      type: "select",
      label: "showOn",
      // "none" is the sentinel value for "no breakpoint restriction".
      // Radix Select does not accept empty-string values.
      options: [
        "none",
        "sm",
        "md",
        "lg",
        "xl",
        "2xl",
        ">400px",
        ">=640px",
        "<768px",
        "<=1024px",
      ],
    },
    {
      prop: "containerQuery",
      type: "boolean",
      label: "containerQuery",
    },
  ],

  note: `
### Manual boolean gate

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
\`\`\`

### Breakpoint against the viewport (default)

Set \`showOn\` to automatically mount/unmount based on **viewport** width.
The component subscribes to \`window.matchMedia\` — no extra state or memo needed:

\`\`\`ts
// Desktop sidebar — visible on lg screens and up
registerCard("myApp/layout", Conditional({
  showOn:  "lg",
  content: "myApp/desktopSidebar",
}));

// Mobile drawer — visible only on narrow viewports
registerCard("myApp/mobileNav", Conditional({
  showOn:  "<768px",
  content: "myApp/mobileDrawer",
}));
\`\`\`

### Breakpoint against the enclosing container

Set \`containerQuery: true\` to measure the card's own rendered width via
\`ResizeObserver\` instead of the global viewport.  This is useful inside
resizable panels, grid cells, or any layout where the card's container width
differs from the window width:

\`\`\`ts
// Show detail panel only when the grid cell is wide enough
registerCard("myApp/gridCell", Conditional({
  showOn:         ">400px",
  containerQuery: true,
  content:        "myApp/detailPanel",
}));
\`\`\`

> **Trade-off:** when \`containerQuery\` is \`true\` a thin \`<div style="width:100%">\`
> wrapper is added to the DOM so that \`ResizeObserver\` has an element to
> observe.  In viewport mode (\`containerQuery: false\`, the default) no extra
> DOM node is added.

### Combined (AND)

Both conditions must be satisfied:

\`\`\`ts
registerCard("myApp/adminSidebar", Conditional({
  show:    memo((s: AppState) => s.isAdmin),
  showOn:  "lg",
  content: "myApp/adminPanel",
}));
\`\`\`
  `.trim(),
});
