/**
 * Playground definition for the `graphin` card.
 */
import {definePlayground} from "@/playground/definePlayground";
import {Graphin, type GraphinProps} from "./index";

export default definePlayground<GraphinProps>({
  cardId: "graphin",
  title: "Graphin",

  introduction: `
An interactive graph visualisation card backed by **AntV G6**.

Provide a \`data\` object with \`nodes\` and \`edges\` arrays to render a network
graph.  Use the \`options\` prop to override any \`GraphOptions\` (layout
algorithm, interaction modes, etc.) supported by G6.

Optionally supply a \`tooltip\` config with \`node\` and/or \`edge\` card refs to
render a custom Pihanga card as the tooltip when the user hovers a node or
edge.

Use it for knowledge graphs, dependency maps, org charts, network topology
diagrams, or any relationship data that benefits from a force-directed or
hierarchical layout.
  `.trim(),

  preview: (props) => Graphin(props),

  defaultProps: {
    data: {
      nodes: [
        {id: "n1", data: {label: "Node 1"}},
        {id: "n2", data: {label: "Node 2"}},
        {id: "n3", data: {label: "Node 3"}},
      ],
      edges: [
        {id: "e1", source: "n1", target: "n2"},
        {id: "e2", source: "n2", target: "n3"},
        {id: "e3", source: "n3", target: "n1"},
      ],
    },
  },

  facets: [
    {
      id: "triangle",
      title: "Triangle",
      description: "Three nodes connected in a cycle — the minimal graph.",
      props: {
        data: {
          nodes: [
            {id: "a", data: {label: "Alpha"}},
            {id: "b", data: {label: "Beta"}},
            {id: "c", data: {label: "Gamma"}},
          ],
          edges: [
            {id: "ab", source: "a", target: "b"},
            {id: "bc", source: "b", target: "c"},
            {id: "ca", source: "c", target: "a"},
          ],
        },
      },
    },
    {
      id: "hub-and-spoke",
      title: "Hub and spoke",
      description: "A central hub node connected to several leaf nodes.",
      props: {
        data: {
          nodes: [
            {id: "hub", data: {label: "Hub"}},
            {id: "s1", data: {label: "Service A"}},
            {id: "s2", data: {label: "Service B"}},
            {id: "s3", data: {label: "Service C"}},
            {id: "s4", data: {label: "Service D"}},
          ],
          edges: [
            {id: "e1", source: "hub", target: "s1"},
            {id: "e2", source: "hub", target: "s2"},
            {id: "e3", source: "hub", target: "s3"},
            {id: "e4", source: "hub", target: "s4"},
          ],
        },
      },
    },
    {
      id: "custom-className",
      title: "Custom className",
      description:
        "Apply Tailwind classes to control the graph container size.",
      props: {
        data: {
          nodes: [
            {id: "x", data: {label: "X"}},
            {id: "y", data: {label: "Y"}},
          ],
          edges: [{id: "xy", source: "x", target: "y"}],
        },
        className: "h-48 rounded border",
      },
    },
  ],

  controls: [
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. h-96 border rounded",
    },
  ],

  note: `
Render a knowledge-graph driven by application state:

\`\`\`ts
import {registerCard, memo} from "@pihanga2/core";
import {Graphin} from "@/cards/graphin";
import type {AppState} from "@/app.state";

registerCard("myApp/knowledgeGraph", Graphin({
  data: memo((s: AppState) => ({
    nodes: s.entities.map((e) => ({
      id:   e.id,
      data: {label: e.name},
    })),
    edges: s.relations.map((r) => ({
      id:     r.id,
      source: r.from,
      target: r.to,
    })),
  })),
  options: {
    layout: {type: "force"},
    autoFit: "view",
  },
}));
\`\`\`
  `.trim(),
});
