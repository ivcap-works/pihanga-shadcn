/**
 * Playground definition for the `pi/scrollbar-with-annotations` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {Stack} from "@/cards/stack";
import {Typography} from "@/cards/typography";
import {
  ScrollbarWithAnnotations,
  type ScrollbarWithAnnotationsProps,
} from "./index";

// ---------------------------------------------------------------------------
// Sample annotations used by the playground facets.
// ---------------------------------------------------------------------------

const MIXED_ANNOTATIONS = [
  {
    id: "todo-1",
    position: 60,
    markerType: "point" as const,
    type: "todo" as const,
    title: "Add input validation",
    description: "Validate all input parameters before processing.",
  },
  {
    id: "error-1",
    position: 350,
    markerType: "point" as const,
    type: "error" as const,
    title: "Missing type validation",
    description: "Data type is not validated — could cause runtime errors.",
  },
  {
    id: "warning-1",
    position: 156,
    markerType: "bar" as const,
    type: "warning" as const,
    title: "Handle null values",
    description: "Current implementation crashes if item is null.",
  },
  {
    id: "review-1",
    position: 200,
    extent: 140,
    markerType: "range" as const,
    type: "review" as const,
    title: "Performance optimisation",
    description:
      "Consider caching results or using memoisation for repeated calls.",
  },
  {
    id: "fixme-1",
    position: 420,
    extent: 60,
    markerType: "range" as const,
    type: "fixme" as const,
    title: "Broken edge-case handler",
    description:
      "The handler for empty arrays returns undefined instead of an empty result set.",
  },
];

const POINT_ONLY = MIXED_ANNOTATIONS.filter((a) => a.markerType === "point");
const BAR_ONLY = MIXED_ANNOTATIONS.filter((a) => a.markerType === "bar");
const RANGE_ONLY = MIXED_ANNOTATIONS.filter((a) => a.markerType === "range");

/** Build a fresh content card for each preview render to avoid Pihanga anonymous-card identity conflicts. */
function makeContentCard() {
  return Stack({
    direction: "column",
    spacing: 4,
    className: "p-4",
    content: Array.from({length: 10}, (_, i) =>
      Typography({
        text: `Item ${i + 1} — lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      }),
    ),
  });
}

export default definePlayground<ScrollbarWithAnnotationsProps>({
  cardId: "pi/scrollbar-with-annotations",
  title: "Scrollbar With Annotations",

  preview: (props) =>
    ScrollbarWithAnnotations({
      ...props,
      contentCard: makeContentCard(),
      className: "h-96",
    }),

  defaultProps: {
    contentCard: "pi/empty",
    annotations: MIXED_ANNOTATIONS,
    reportEventsOnScroll: false,
  },

  facets: [
    {
      id: "mixed",
      title: "Mixed markers",
      description:
        "All three marker shapes — point, bar and range — displayed together.",
      props: {
        annotations: MIXED_ANNOTATIONS,
      },
    },
    {
      id: "point-only",
      title: "Point markers",
      description:
        "Circular dot markers (default shape). Good for single-position annotations.",
      props: {
        annotations: POINT_ONLY,
      },
    },
    {
      id: "bar-only",
      title: "Bar markers",
      description:
        "Short fixed-height rectangles. Useful for discrete events with no meaningful extent.",
      props: {
        annotations: BAR_ONLY,
      },
    },
    {
      id: "range-only",
      title: "Range markers",
      description:
        "Proportional-height rectangles driven by the annotation's `extent`. CSS `min-height` keeps them clickable.",
      props: {
        annotations: RANGE_ONLY,
      },
    },
    {
      id: "empty",
      title: "No annotations",
      description:
        "Viewer with an empty annotation list — scrollbar track is bare.",
      props: {
        annotations: [],
      },
    },
  ],

  controls: [
    {
      prop: "reportEventsOnScroll",
      type: "boolean",
      label: "Report hover events on scroll",
    },
  ],

  note: `
Wire up the viewer and handle annotation clicks in a reducer:

\`\`\`ts
import {registerCard, memo} from "@pihanga2/core";
import {
  ScrollbarWithAnnotations,
  onScrollbarAnnotationClicked,
} from "@/cards/scrollbarWithAnnotations";
import type {AppState} from "@/app.state";

// Register the annotated viewer
registerCard("myPage/viewer", (state: AppState) =>
  ScrollbarWithAnnotations({
    contentCard: "myPage/content",
    annotations: state.annotations,
  })
);

// Open a detail dialog when a marker is clicked
onScrollbarAnnotationClicked((state: AppState, {annotation}) => ({
  ...state,
  selectedAnnotation: annotation,
  annotationDialogOpen: true,
}));
\`\`\`

Override colours and sizes with CSS custom properties:

\`\`\`css
.my-page {
  --swa-point-size: 10px;
  --swa-bar-height: 8px;
  --swa-range-min-height: 6px;
  --swa-color-error: hotpink;
}
\`\`\`
  `.trim(),
});
