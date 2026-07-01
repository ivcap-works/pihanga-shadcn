/**
 * Playground definition for the `graphin` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {
  Graphin,
  type GraphinProps,
  onGraphinNodeHovered,
  onGraphinNodeHoverEnd,
  onGraphinNodeClicked,
  onGraphinNodeDblClicked,
  onGraphinTooltipOpen,
  onGraphinTooltipClose,
  onGraphinContextMenuOpen,
  onGraphinContextMenuClose,
} from "./index";
// Side-effect import — registers the demo tooltip / context-menu content cards
// used by the "tooltip" and "context-menu" playground facets below.
import "./graphin.playground-cards";

// Shared directed microservices graph data used in several facets.
const microservicesData: GraphinProps["data"] = {
  nodes: [
    {id: "gw", data: {displayName: "API Gateway", type: "gateway"}},
    {id: "auth", data: {displayName: "Auth", type: "service"}},
    {id: "users", data: {displayName: "Users", type: "service"}},
    {id: "orders", data: {displayName: "Orders", type: "service"}},
    {id: "notify", data: {displayName: "Notify", type: "service"}},
    {id: "db-u", data: {displayName: "User DB", type: "db"}},
    {id: "db-o", data: {displayName: "Order DB", type: "db"}},
  ],
  edges: [
    {id: "gw-a", source: "gw", target: "auth"},
    {id: "gw-u", source: "gw", target: "users"},
    {id: "gw-o", source: "gw", target: "orders"},
    {id: "u-db", source: "users", target: "db-u"},
    {id: "o-db", source: "orders", target: "db-o"},
    {id: "o-n", source: "orders", target: "notify"},
    {id: "o-u", source: "orders", target: "users"},
  ],
};

export default definePlayground<GraphinProps>({
  cardId: "graphin",
  title: "Graphin",

  preview: (props) => Graphin(props),

  defaultProps: {
    suppressZoom: true,
    data: {
      nodes: [
        {id: "n1", data: {displayName: "Node 1"}},
        {id: "n2", data: {displayName: "Node 2"}},
        {id: "n3", data: {displayName: "Node 3"}},
      ],
      edges: [
        {id: "e1", source: "n1", target: "n2"},
        {id: "e2", source: "n2", target: "n3"},
        {id: "e3", source: "n3", target: "n1"},
      ],
    },
  },

  facets: [
    // ── Basic shapes ──────────────────────────────────────────────────────
    {
      id: "triangle",
      title: "Triangle (force-atlas2)",
      description:
        "Three nodes in a cycle — default force-atlas2 layout (general-purpose force).",
      props: {
        data: {
          nodes: [
            {id: "a", data: {displayName: "Alpha"}},
            {id: "b", data: {displayName: "Beta"}},
            {id: "c", data: {displayName: "Gamma"}},
          ],
          edges: [
            {id: "ab", source: "a", target: "b"},
            {id: "bc", source: "b", target: "c"},
            {id: "ca", source: "c", target: "a"},
          ],
        },
      },
    },
    // ── Layouts ───────────────────────────────────────────────────────────
    {
      id: "layout-dagre",
      title: "Dagre — hierarchical",
      description:
        'layout="dagre" arranges nodes in top-down layers — ideal for DAGs, ' +
        "pipelines, and org charts.  Set options.layout.rankdir to switch between " +
        "'TB' (top→bottom), 'LR' (left→right), 'BT', or 'RL'.",
      props: {
        data: microservicesData,
        layout: "dagre",
        options: {
          layout: {type: "dagre", rankdir: "TB", nodesep: 30, ranksep: 50},
        },
        className: "h-96 border rounded",
      },
    },
    {
      id: "layout-dagre-lr",
      title: "Dagre LR — left to right",
      description:
        "Same dagre layout with rankdir: 'LR' — works well for wide graphs " +
        "where the hierarchy flows left to right.",
      props: {
        data: microservicesData,
        layout: "dagre",
        options: {
          layout: {type: "dagre", rankdir: "LR", nodesep: 30, ranksep: 60},
        },
        className: "h-64 border rounded",
      },
    },
    {
      id: "layout-circular",
      title: "Circular",
      description:
        'layout="circular" places every node on a circle, which makes ' +
        "symmetric patterns easy to spot.",
      props: {
        data: microservicesData,
        layout: "circular",
        className: "h-80 border rounded",
      },
    },
    {
      id: "layout-grid",
      title: "Grid",
      description:
        'layout="grid" places nodes in a uniform grid — useful for comparing ' +
        "many equally-weighted entities.",
      props: {
        data: {
          nodes: Array.from({length: 12}, (_, i) => ({
            id: `n${i}`,
            data: {displayName: `Node ${i + 1}`},
          })),
          edges: Array.from({length: 10}, (_, i) => ({
            id: `e${i}`,
            source: `n${i}`,
            target: `n${i + 1}`,
          })),
        },
        layout: "grid",
        className: "h-80 border rounded",
      },
    },
    {
      id: "layout-concentric",
      title: "Concentric",
      description:
        'layout="concentric" groups nodes into concentric rings ordered by ' +
        "their degree (number of connections) — hub nodes land in the centre.",
      props: {
        data: {
          nodes: [
            {id: "hub", data: {displayName: "Hub"}},
            {id: "a", data: {displayName: "A"}},
            {id: "b", data: {displayName: "B"}},
            {id: "c", data: {displayName: "C"}},
            {id: "d", data: {displayName: "D"}},
            {id: "e", data: {displayName: "E"}},
            {id: "x1", data: {displayName: "Leaf 1"}},
            {id: "x2", data: {displayName: "Leaf 2"}},
          ],
          edges: [
            {id: "ha", source: "hub", target: "a"},
            {id: "hb", source: "hub", target: "b"},
            {id: "hc", source: "hub", target: "c"},
            {id: "hd", source: "hub", target: "d"},
            {id: "he", source: "hub", target: "e"},
            {id: "ax1", source: "a", target: "x1"},
            {id: "bx2", source: "b", target: "x2"},
          ],
        },
        layout: "concentric",
        className: "h-80 border rounded",
      },
    },
    {
      id: "layout-radial",
      title: "Radial",
      description:
        'layout="radial" radiates nodes outward from a focal node — great ' +
        "for exploring ego networks.",
      props: {
        data: microservicesData,
        layout: "radial",
        className: "h-80 border rounded",
      },
    },
    // ── Directed graph ────────────────────────────────────────────────────
    {
      id: "directed",
      title: "Directed graph (arrows)",
      description:
        "directed={true} renders an arrowhead at the target end of every edge. " +
        'Combined with layout="dagre" this gives a clear flow diagram.',
      props: {
        data: microservicesData,
        layout: "dagre",
        directed: true,
        options: {
          layout: {type: "dagre", rankdir: "TB", nodesep: 30, ranksep: 50},
        },
        className: "h-96 border rounded",
      },
    },
    {
      id: "directed-lr",
      title: "Directed LR pipeline",
      description:
        "Directed graph with left-to-right dagre layout — ideal for showing " +
        "data pipelines or workflow stages.",
      props: {
        data: {
          nodes: [
            {id: "ingest", data: {displayName: "Ingest"}},
            {id: "validate", data: {displayName: "Validate"}},
            {id: "transform", data: {displayName: "Transform"}},
            {id: "enrich", data: {displayName: "Enrich"}},
            {id: "load", data: {displayName: "Load"}},
            {id: "dq", data: {displayName: "DQ Check"}},
            {id: "report", data: {displayName: "Report"}},
          ],
          edges: [
            {id: "e1", source: "ingest", target: "validate"},
            {id: "e2", source: "validate", target: "transform"},
            {id: "e3", source: "transform", target: "enrich"},
            {id: "e4", source: "enrich", target: "load"},
            {id: "e5", source: "load", target: "dq"},
            {id: "e6", source: "dq", target: "report"},
            {id: "e7", source: "dq", target: "validate"},
          ],
        },
        layout: "dagre",
        directed: true,
        options: {
          layout: {type: "dagre", rankdir: "LR", nodesep: 20, ranksep: 60},
        },
        className: "h-64 border rounded",
      },
    },
    // ── Styled nodes ──────────────────────────────────────────────────────
    {
      id: "styled-nodes",
      title: "Styled nodes",
      description:
        "Per-node shape, color, size, and stroke via options.node.type and " +
        "options.node.style functions.  Each function receives the full node " +
        "datum so you can read any field from node.data to drive the style.",
      props: {
        data: {
          nodes: [
            {id: "gw", data: {displayName: "API Gateway", role: "gateway"}},
            {id: "auth", data: {displayName: "Auth", role: "service"}},
            {id: "users", data: {displayName: "Users", role: "service"}},
            {id: "orders", data: {displayName: "Orders", role: "service"}},
            {id: "db-u", data: {displayName: "User DB", role: "db"}},
            {id: "db-o", data: {displayName: "Order DB", role: "db"}},
          ],
          edges: [
            {id: "gw-a", source: "gw", target: "auth"},
            {id: "gw-u", source: "gw", target: "users"},
            {id: "gw-o", source: "gw", target: "orders"},
            {id: "u-db", source: "users", target: "db-u"},
            {id: "o-db", source: "orders", target: "db-o"},
          ],
        },
        layout: "dagre",
        directed: true,
        // nodeStyleKey tells the card which field in node.data holds the style name.
        // Defaults to "style" — here we reuse the existing "role" field.
        nodeStyleKey: "role",
        // All const values — no functions needed in props (safe for Redux).
        nodeStyles: {
          gateway: {
            type: "star",
            fill: "#e67e22",
            stroke: "#ca6f1e",
            size: 48,
            labelFill: "#fff",
            lineWidth: 2,
          },
          service: {
            type: "circle",
            fill: "#2980b9",
            stroke: "#1a6fa5",
            size: 32,
            labelFill: "#fff",
            lineWidth: 2,
          },
          db: {
            type: "rect",
            fill: "#8e44ad",
            stroke: "#7d3c98",
            size: 22,
            labelFill: "#fff",
            lineWidth: 2,
          },
        },
        options: {
          layout: {type: "dagre", rankdir: "TB", nodesep: 30, ranksep: 60},
        },
        className: "h-96 border rounded",
      },
    },
    // ── Node states ───────────────────────────────────────────────────────
    {
      id: "node-states",
      title: "Node states (element state styles)",
      description:
        "options.node.state defines named visual overlays — like CSS classes — " +
        "applied imperatively via dispatchGraphinSetNodeStates() without re-running " +
        "the layout.  This facet shows the visual result of four states: " +
        "failed (red), degraded (orange), ok (green), and dimmed (faded).  " +
        "In a real app the data.status field would be driven by live monitoring " +
        "data and the states applied via the OP action on every update.",
      props: {
        data: {
          nodes: [
            // Each node carries a composite "style" key that encodes BOTH
            // shape (role) and colour (status) in a single lookup string.
            // In production you'd compute this key from Redux state:
            //   style: `${node.role}-${node.status}`
            {
              id: "gw",
              data: {displayName: "API Gateway", style: "gateway-ok"},
            },
            {
              id: "auth",
              data: {displayName: "Auth", style: "service-ok"},
            },
            {
              id: "users",
              data: {displayName: "Users", style: "service-failed"},
            },
            {
              id: "orders",
              data: {displayName: "Orders", style: "service-degraded"},
            },
            {
              id: "db-u",
              data: {displayName: "User DB", style: "db-failed"},
            },
            {
              id: "db-o",
              data: {displayName: "Order DB", style: "db-dimmed"},
            },
          ],
          edges: [
            {id: "gw-a", source: "gw", target: "auth"},
            {id: "gw-u", source: "gw", target: "users"},
            {id: "gw-o", source: "gw", target: "orders"},
            {id: "u-db", source: "users", target: "db-u"},
            {id: "o-db", source: "orders", target: "db-o"},
          ],
        },
        layout: "dagre",
        directed: true,
        // nodeStyleKey defaults to "style" — reads node.data.style for the lookup key.
        // Each entry covers BOTH shape (type) and colour — fully serialisable, no functions.
        nodeStyles: {
          // gateway: star shape
          "gateway-ok": {
            type: "star",
            fill: "#27ae60",
            stroke: "#1e8449",
            size: 44,
            labelFill: "#fff",
            lineWidth: 2,
          },
          "gateway-failed": {
            type: "star",
            fill: "#e74c3c",
            stroke: "#c0392b",
            size: 44,
            labelFill: "#fff",
            lineWidth: 3,
          },
          // service: circle shape
          "service-ok": {
            type: "circle",
            fill: "#27ae60",
            stroke: "#1e8449",
            size: 32,
            labelFill: "#fff",
            lineWidth: 2,
          },
          "service-failed": {
            type: "circle",
            fill: "#e74c3c",
            stroke: "#c0392b",
            size: 32,
            labelFill: "#fff",
            lineWidth: 3,
          },
          "service-degraded": {
            type: "circle",
            fill: "#e67e22",
            stroke: "#ca6f1e",
            size: 32,
            labelFill: "#fff",
            lineWidth: 2,
          },
          // db: rect shape
          "db-ok": {
            type: "rect",
            fill: "#27ae60",
            stroke: "#1e8449",
            size: 24,
            labelFill: "#fff",
            lineWidth: 2,
          },
          "db-failed": {
            type: "rect",
            fill: "#e74c3c",
            stroke: "#c0392b",
            size: 24,
            labelFill: "#fff",
            lineWidth: 3,
          },
          "db-dimmed": {
            type: "rect",
            fill: "#95a5a6",
            stroke: "#7f8c8d",
            size: 24,
            labelFill: "#fff",
            lineWidth: 1,
            opacity: 0.35,
          },
        },
        options: {
          layout: {type: "dagre", rankdir: "TB", nodesep: 30, ranksep: 60},
        },
        className: "h-96 border rounded",
      },
    },
    // ── Tooltip ───────────────────────────────────────────────────────────
    {
      id: "tooltip",
      title: "Hover tooltip",
      description:
        "tooltip.node points to any PiCard.  Hover a node to see the floating " +
        "panel — it is pointer-events:none so it never blocks graph interaction. " +
        "The card receives elementID and elementData as context props.",
      props: {
        data: {
          nodes: [
            {
              id: "gw",
              data: {
                displayName: "API Gateway",
                role: "gateway",
                region: "us-east-1",
              },
            },
            {
              id: "auth",
              data: {displayName: "Auth", role: "service", owner: "team-iam"},
            },
            {
              id: "users",
              data: {displayName: "Users", role: "service", owner: "team-plat"},
            },
            {
              id: "orders",
              data: {
                displayName: "Orders",
                role: "service",
                owner: "team-commerce",
              },
            },
            {
              id: "db-u",
              data: {displayName: "User DB", role: "db", engine: "postgres"},
            },
            {
              id: "db-o",
              data: {displayName: "Order DB", role: "db", engine: "mysql"},
            },
          ],
          edges: [
            {id: "gw-a", source: "gw", target: "auth"},
            {id: "gw-u", source: "gw", target: "users"},
            {id: "gw-o", source: "gw", target: "orders"},
            {id: "u-db", source: "users", target: "db-u"},
            {id: "o-db", source: "orders", target: "db-o"},
          ],
        },
        layout: "dagre",
        directed: true,
        nodeStyleKey: "role",
        nodeStyles: {
          gateway: {
            type: "star",
            fill: "#e67e22",
            stroke: "#ca6f1e",
            size: 48,
            labelFill: "#fff",
            lineWidth: 2,
          },
          service: {
            type: "circle",
            fill: "#2980b9",
            stroke: "#1a6fa5",
            size: 32,
            labelFill: "#fff",
            lineWidth: 2,
          },
          db: {
            type: "rect",
            fill: "#8e44ad",
            stroke: "#7d3c98",
            size: 22,
            labelFill: "#fff",
            lineWidth: 2,
          },
        },
        options: {
          layout: {type: "dagre", rankdir: "TB", nodesep: 30, ranksep: 60},
        },
        // The tooltip content card is registered in graphin.playground-cards.tsx.
        // It shows elementID + all fields from elementData.
        // Replace "pg/graphin/demo-tooltip" with your own card name in a real app.
        tooltip: {node: "pg/graphin/demo-tooltip"},
        className: "h-96 border rounded",
      },
    },
    // ── Context menu ──────────────────────────────────────────────────────
    {
      id: "context-menu",
      title: "Context panel (click)",
      description:
        "contextMenu.node points to any PiCard.  Click a node to open the " +
        "interactive panel.  Dismiss by clicking outside, pressing the ✕ button " +
        "in the panel header, or calling the onClose() callback forwarded to the " +
        "content card.",
      props: {
        data: {
          nodes: [
            {
              id: "gw",
              data: {
                displayName: "API Gateway",
                role: "gateway",
                region: "us-east-1",
              },
            },
            {
              id: "auth",
              data: {displayName: "Auth", role: "service", owner: "team-iam"},
            },
            {
              id: "users",
              data: {displayName: "Users", role: "service", owner: "team-plat"},
            },
            {
              id: "orders",
              data: {
                displayName: "Orders",
                role: "service",
                owner: "team-commerce",
              },
            },
            {
              id: "db-u",
              data: {displayName: "User DB", role: "db", engine: "postgres"},
            },
            {
              id: "db-o",
              data: {displayName: "Order DB", role: "db", engine: "mysql"},
            },
          ],
          edges: [
            {id: "gw-a", source: "gw", target: "auth"},
            {id: "gw-u", source: "gw", target: "users"},
            {id: "gw-o", source: "gw", target: "orders"},
            {id: "u-db", source: "users", target: "db-u"},
            {id: "o-db", source: "orders", target: "db-o"},
          ],
        },
        layout: "dagre",
        directed: true,
        nodeStyleKey: "role",
        nodeStyles: {
          gateway: {
            type: "star",
            fill: "#e67e22",
            stroke: "#ca6f1e",
            size: 48,
            labelFill: "#fff",
            lineWidth: 2,
          },
          service: {
            type: "circle",
            fill: "#2980b9",
            stroke: "#1a6fa5",
            size: 32,
            labelFill: "#fff",
            lineWidth: 2,
          },
          db: {
            type: "rect",
            fill: "#8e44ad",
            stroke: "#7d3c98",
            size: 22,
            labelFill: "#fff",
            lineWidth: 2,
          },
        },
        options: {
          layout: {type: "dagre", rankdir: "TB", nodesep: 30, ranksep: 60},
        },
        // The context-menu content card is registered in graphin.playground-cards.tsx.
        // It shows all node data fields and a Dismiss button (calls onClose).
        // Replace "pg/graphin/demo-context-menu" with your own card name in a real app.
        contextMenu: {node: "pg/graphin/demo-context-menu"},
        className: "h-96 border rounded",
      },
    },
    // ── Events ────────────────────────────────────────────────────────────
    {
      id: "events",
      title: "Node events",
      description:
        "Hover, click, or double-click any node — events appear in the Events panel below.",
      props: {
        data: microservicesData,
        layout: "dagre",
        directed: true,
        options: {
          layout: {type: "dagre", rankdir: "TB", nodesep: 30, ranksep: 50},
        },
        className: "h-96 border rounded",
      },
    },
  ],

  controls: [
    {
      prop: "layout",
      type: "select",
      label: "Layout",
      options: [
        "force-atlas2",
        "force",
        "gforce",
        "d3-force",
        "fruchterman",
        "dagre",
        "antv-dagre",
        "circular",
        "concentric",
        "radial",
        "grid",
        "mds",
        "random",
        "snake",
        "fishbone",
      ],
    },
    {
      prop: "zoomLevel",
      type: "number",
      label: "Zoom level",
      placeholder: "0.02–16  (1 = 100 %)",
    },
    {
      prop: "suppressZoom",
      type: "boolean",
      label: "Suppress zoom",
    },
    {
      prop: "suppressPan",
      type: "boolean",
      label: "Suppress pan (canvas)",
    },
    {
      prop: "suppressDrag",
      type: "boolean",
      label: "Suppress drag (nodes)",
    },
    {
      prop: "directed",
      type: "boolean",
      label: "Directed (arrows)",
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. h-96 border rounded",
    },
  ],

  registerEvents: (r, logEvent) => {
    // Fires when the pointer enters a node.
    onGraphinNodeHovered(r, (state, ev) => {
      logEvent(state, "onNodeHovered", ev as Record<string, unknown>);
    });
    // Fires when the pointer leaves a node.
    onGraphinNodeHoverEnd(r, (state, ev) => {
      logEvent(state, "onNodeHoverEnd", ev as Record<string, unknown>);
    });
    // Fires on a single click on a node.
    onGraphinNodeClicked(r, (state, ev) => {
      logEvent(state, "onNodeClicked", ev as Record<string, unknown>);
    });
    // Fires on a double-click on a node.
    onGraphinNodeDblClicked(r, (state, ev) => {
      logEvent(state, "onNodeDblClicked", ev as Record<string, unknown>);
    });
    // Fires when a hover tooltip becomes visible.
    onGraphinTooltipOpen(r, (state, ev) => {
      logEvent(state, "onTooltipOpen", ev as Record<string, unknown>);
    });
    // Fires when a hover tooltip is dismissed.
    onGraphinTooltipClose(r, (state, ev) => {
      logEvent(state, "onTooltipClose", ev as Record<string, unknown>);
    });
    // Fires when a context-menu panel opens.
    onGraphinContextMenuOpen(r, (state, ev) => {
      logEvent(state, "onContextMenuOpen", ev as Record<string, unknown>);
    });
    // Fires when a context-menu panel closes.
    onGraphinContextMenuClose(r, (state, ev) => {
      logEvent(state, "onContextMenuClose", ev as Record<string, unknown>);
    });
  },

  note: `
## Usage patterns

### 1 — Directed hierarchical graph

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {Graphin} from "@/cards/graphin";
import type {AppState} from "@/app.state";

registerCard("myApp/pipeline", Graphin({
  layout: "dagre",
  directed: true,
  options: {
    layout: {
      type: "dagre",
      rankdir: "LR",   // left → right
      nodesep: 20,
      ranksep: 60,
    },
  },
  data: memo((s: AppState) => ({
    nodes: s.pipeline.stages.map((s) => ({ id: s.id, data: { displayName: s.name } })),
    edges: s.pipeline.edges.map((e) => ({ id: e.id, source: e.from, target: e.to })),
  })),
}));
\`\`\`

### 2 — Reacting to node events

\`\`\`ts
import {
  Graphin,
  onGraphinNodeClicked,
  onGraphinNodeDblClicked,
} from "@/cards/graphin";

onGraphinNodeClicked("myApp/pipeline", (state, { nodeId, nodeData }) => ({
  ...state,
  selectedNodeId: nodeId,
}));

onGraphinNodeDblClicked("myApp/pipeline", (state, { nodeId }) => ({
  ...state,
  zoomedNodeId: nodeId,
}));
\`\`\`

### 3 — Hover tooltip holding a PiCard

\`\`\`ts
import {Graphin} from "@/cards/graphin";
import type {TooltipContext} from "@/cards/graphin";

registerCard("myApp/nodeTooltip", Typography({
  text: (_, ctx) => {
    const { elementID, elementData } = ctx.ctxtProps as TooltipContext;
    return elementID + ": " + JSON.stringify(elementData);
  },
}));

registerCard("myApp/graph", Graphin({
  layout: "dagre",
  directed: true,
  data: graphData,
  tooltip: { node: "myApp/nodeTooltip" },
}));
\`\`\`

### 4 — Context panel (modal-like) holding a PiCard

\`\`\`ts
import {Graphin} from "@/cards/graphin";
import type {ContextMenuContext} from "@/cards/graphin";

registerCard("myApp/nodePanel", Stack({
  cards: ["myApp/nodePanelTitle", "myApp/nodePanelActions"],
}));

registerCard("myApp/graph", Graphin({
  data: graphData,
  contextMenu: { node: "myApp/nodePanel" },
}));
\`\`\`
  `.trim(),
});
