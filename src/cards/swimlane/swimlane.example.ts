/**
 * Playground definition for the `shad/swimlane` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {
  Swimlane,
  onSwimlaneHoverChanged,
  onSwimlaneItemClicked,
  type SwimlaneProps,
} from "./index";
import {buildDemoModel} from "./swimlane.demo";

const inFlight = buildDemoModel();
const completed = buildDemoModel({complete: true});

export default definePlayground<SwimlaneProps>({
  cardId: "shad/swimlane",
  title: "Swimlane",

  preview: (props) => Swimlane(props),

  defaultProps: {
    model: inFlight,
    showPending: true,
    autoFollow: false,
    showTooltip: true,
  },

  facets: [
    {
      id: "in-flight",
      title: "In flight",
      description:
        "A checkout still running: outstanding replies and an announced callback are shown below the “now” line.",
      props: {model: inFlight, autoFollow: false},
    },
    {
      id: "completed",
      title: "Completed",
      description:
        "The same flow after all replies arrived — rows that replaced an outstanding message are marked ✓.",
      props: {model: completed, autoFollow: false},
    },
    {
      id: "compact",
      title: "Compact",
      description: "Narrower lanes and shorter rows for dense deployments.",
      props: {model: completed, laneWidth: 80, rowHeight: 24, headerHeight: 110, autoFollow: false},
    },
    {
      id: "no-pending",
      title: "Without outstanding zone",
      description: "Only real events; nothing is projected below the last row.",
      props: {model: inFlight, showPending: false, autoFollow: false},
    },
    {
      id: "highlight",
      title: "External highlight",
      description: "Highlight a call chain from app state via `highlightId` (here: the checkout request `c1`).",
      props: {model: inFlight, highlightId: "c1", autoFollow: false},
    },
  ],

  controls: [
    {prop: "showPending", type: "boolean", label: "Show outstanding messages"},
    {prop: "showTooltip", type: "boolean", label: "Show tooltip"},
    {prop: "autoFollow", type: "boolean", label: "Auto-follow newest row"},
    {prop: "laneWidth", type: "number", label: "Lane width (px)"},
    {prop: "rowHeight", type: "number", label: "Row height (px)"},
    {prop: "highlightId", type: "text", label: "Highlight call id", placeholder: "e.g. c3"},
  ],

  registerEvents: (r, logEvent) => {
    onSwimlaneHoverChanged(r, (state, ev) => {
      logEvent(state, "onSwimlaneHoverChanged", {
        target: ev.target ? `${ev.target.kind}:${ev.target.id}` : null,
        previous: ev.previous ? `${ev.previous.kind}:${ev.previous.id}` : null,
      });
    });
    onSwimlaneItemClicked(r, (state, ev) => {
      logEvent(state, "onSwimlaneItemClicked", {
        target: `${ev.target.kind}:${ev.target.id}`,
        span: ev.span ? `${ev.span.from} → ${ev.span.to} ${ev.span.label}` : undefined,
      });
    });
  },

  note: `
\`\`\`ts
// app.state.ts
import type {ReduxState} from "@pihanga2/core";
import type {SwimlaneModel, SwimlaneTarget} from "@/cards/swimlane";
export type AppState = ReduxState & {
  swimlane: SwimlaneModel;
  selected?: SwimlaneTarget;
};

// initial state
import {createSwimlaneModel} from "@/cards/swimlane";
const initialState = {swimlane: createSwimlaneModel({maxRows: 2000})};

// app.pihanga.ts
import {register, registerCard} from "@pihanga2/core";
import {
  Swimlane, registerSwimlaneModel, onSwimlaneItemClicked,
} from "@/cards/swimlane";

register((r) => {
  // ingest SWIMLANE_DATA_ACTION.EVENTS_RECEIVED for model "main"
  registerSwimlaneModel<AppState>(r, "main", (s) => s.swimlane);

  onSwimlaneItemClicked<AppState>(r, (state, {target}) => {
    state.selected = target;
  });
});

registerCard("monitor/swimlane", Swimlane<AppState>({
  model: (s) => s.swimlane,
  highlightId: (s) => s.selected?.id,
  stickyTop: 56,            // below a navbar
}));

// stream adapter (e.g. started from onInit): batch per animation frame
import {dispatchSwimlaneEvents, type SwimlaneEvent} from "@/cards/swimlane";
function connect(dispatch: DispatchF, url: string) {
  const buf: SwimlaneEvent[] = [];
  const ws = new WebSocket(url);
  ws.onmessage = (m) => buf.push(JSON.parse(m.data));
  const flush = () => {
    if (buf.length) dispatchSwimlaneEvents(dispatch, {modelId: "main", events: buf.splice(0)});
    requestAnimationFrame(flush);
  };
  requestAnimationFrame(flush);
}
\`\`\`
  `.trim(),
});
