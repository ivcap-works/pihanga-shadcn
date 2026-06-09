/**
 * Playground definition for the `shad/loading-skeleton` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {LoadingSkeleton, type LoadingSkeletonProps} from "./index";

export default definePlayground<LoadingSkeletonProps>({
  cardId: "shad/loading-skeleton",
  title: "Loading Skeleton",

  introduction: `
Wraps an async-loaded content card with animated shimmer rows while data is
being fetched.

Set \`loading: true\` to show placeholder rows; set \`loading: false\` to
transparently render the \`content\` card (or nothing when \`content\` is
omitted).  No extra DOM wrapper is added in the loaded state.

| Prop | Default | Purpose |
|---|---|---|
| \`loading\` | — | Boolean gate; drive with \`memo()\` for reactive updates |
| \`rows\` | \`3\` | Number of placeholder rows |
| \`rowSize\` | \`"md"\` | Row height preset: \`"xs"\` \`"sm"\` \`"md"\` \`"lg"\` \`"xl"\` |
| \`spacing\` | \`"md"\` | Gap between rows: \`"sm"\` \`"md"\` \`"lg"\` |
| \`rowClassName\` | — | Raw Tailwind override for rows (takes precedence over \`rowSize\`) |
| \`className\` | — | Raw Tailwind override for wrapper (takes precedence over \`spacing\`) |
| \`content\` | — | Card to render when \`loading\` is \`false\` |

Use the **preset** props (\`rowSize\` / \`spacing\`) when no Tailwind knowledge is
needed.  Use the raw **override** props for non-standard layouts (e.g. grid).
  `.trim(),

  preview: (props) => LoadingSkeleton(props),

  defaultProps: {
    loading: true,
    rows: 3,
    rowSize: "md",
    spacing: "md",
  },

  // ── Facets ───────────────────────────────────────────────────────────────
  facets: [
    {
      id: "small-rows",
      title: "Small rows",
      description:
        "Short text-line skeleton — e.g. a list of labels or menu items.",
      props: {loading: true, rows: 5, rowSize: "sm", spacing: "sm"},
    },
    {
      id: "medium-rows",
      title: "Medium rows",
      description: "Standard row height — good for input fields or table rows.",
      props: {loading: true, rows: 3, rowSize: "md", spacing: "md"},
    },
    {
      id: "large-rows",
      title: "Large rows",
      description: "Tall rows — e.g. a card list or data panels.",
      props: {loading: true, rows: 4, rowSize: "lg", spacing: "lg"},
    },
    {
      id: "xl-rows",
      title: "XL rows",
      description: "Very tall rows — e.g. image thumbnails or hero sections.",
      props: {loading: true, rows: 2, rowSize: "xl", spacing: "lg"},
    },
    {
      id: "loaded-empty",
      title: "Loaded (no content)",
      description:
        "When `loading` is false and no `content` card is provided the card renders nothing.",
      props: {loading: false, rows: 3},
    },
  ],

  // ── Controls ─────────────────────────────────────────────────────────────
  controls: [
    {prop: "loading", type: "boolean", label: "Loading"},
    {
      prop: "rowSize",
      type: "token",
      label: "Row size",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      prop: "spacing",
      type: "token",
      label: "Spacing",
      options: ["sm", "md", "lg"],
    },
    {prop: "rows", type: "text", label: "Row count", placeholder: "3"},
    {
      prop: "rowClassName",
      type: "text",
      label: "Row classes",
      placeholder: "overrides rowSize",
    },
    {
      prop: "className",
      type: "text",
      label: "Wrapper classes",
      placeholder: "overrides spacing",
    },
  ],

  note: `
**Quick setup** — use preset props, no Tailwind needed:

\`\`\`ts
import {memo, registerCard} from "@pihanga2/core";
import {LoadingSkeleton} from "@/cards/loadingSkeleton";
import type {AppState} from "@/app.state";

registerCard("myApp/serviceArea", LoadingSkeleton({
  loading: memo((s: AppState) => s.servicesLoading),
  rows:    4,
  rowSize: "lg",
  spacing: "lg",
  content: "myApp/serviceList",
}));
\`\`\`

**Custom layout** — override with raw Tailwind when presets aren't enough:

\`\`\`ts
registerCard("myApp/cardGrid", LoadingSkeleton({
  loading:      memo((s: AppState) => s.cardsLoading),
  rows:         6,
  rowClassName: "h-32 rounded-xl bg-primary/10",
  className:    "grid grid-cols-2 gap-4 w-full",
  content:      "myApp/cardGridContent",
}));
\`\`\`
  `.trim(),
});
