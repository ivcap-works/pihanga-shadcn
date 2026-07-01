/**
 * Playground definition for the `loading-overlay` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {LoadingOverlay, type LoadingOverlayProps} from "./index";

export default definePlayground<LoadingOverlayProps>({
  cardId: "loading-overlay",
  title: "Loading Overlay",

  preview: (props) => LoadingOverlay(props),

  defaultProps: {
    content: "pi/empty",
    isLoading: true,
    label: "Loading…",
    fillParent: false,
    viewportCentered: false,
  },

  facets: [
    {
      id: "loading",
      title: "Loading",
      description:
        "Active overlay — spinner and label are shown over the content.",
      props: {content: "pi/empty", isLoading: true, label: "Loading…"},
    },
    {
      id: "not-loading",
      title: "Not loading",
      description: "Overlay is hidden — the content card is fully interactive.",
      props: {content: "pi/empty", isLoading: false},
    },
    {
      id: "custom-label",
      title: "Custom label",
      description: "A descriptive label tells the user what is happening.",
      props: {
        content: "pi/empty",
        isLoading: true,
        label: "Uploading file…",
      },
    },
    {
      id: "no-label",
      title: "No label",
      description: "Spinner only — minimal decoration for tight layouts.",
      props: {content: "pi/empty", isLoading: true},
    },
  ],

  controls: [
    {prop: "isLoading", type: "boolean", label: "Loading"},
    {
      prop: "label",
      type: "text",
      label: "Label",
      placeholder: "e.g. Saving…",
    },
    {prop: "fillParent", type: "boolean", label: "Fill parent"},
    {prop: "viewportCentered", type: "boolean", label: "Viewport centered"},
  ],

  note: `
Wrap any content card with the loading overlay:

\`\`\`ts
import {registerCard, memo} from "@pihanga2/core";
import {LoadingOverlay} from "@/cards/loadingOverlay";
import type {AppState} from "@/app.state";

// Register your actual content card separately
registerCard("myApp/dataTable", DataTable({ … }));

// Wrap it with a loading overlay
registerCard("myApp/dataTableWithLoader", LoadingOverlay({
  content:   "myApp/dataTable",
  isLoading: memo((s: AppState) => s.isFetchingData),
  label:     "Loading results…",
}));
\`\`\`

Toggle \`isLoading\` from a reducer:

\`\`\`ts
import {register} from "@pihanga2/core";
import {onFetchStarted, onFetchCompleted} from "@/app.actions";

register((r) => {
  onFetchStarted(r, (state) => {
    state.isFetchingData = true;
  });
  onFetchCompleted(r, (state) => {
    state.isFetchingData = false;
  });
});
\`\`\`
  `.trim(),
});
