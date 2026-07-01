An interactive graph visualisation card backed by **AntV G6 v5**.

Provide a `data` object with `nodes` and `edges` arrays to render a network
graph.  Use the `options` prop to pass any `GraphOptions` supported by G6.

---

### Layout engines

Use the `layout` shorthand prop to switch between G6's built-in algorithms:

| Value | Best for |
|---|---|
| `"force-atlas2"` | General-purpose force *(default)* |
| `"force"` / `"gforce"` | Classic force-directed |
| `"d3-force"` | D3 force simulation |
| `"fruchterman"` | Fruchterman-Reingold force |
| `"dagre"` | **Hierarchical DAGs** (top-down / left-right) |
| `"antv-dagre"` | AntV variant of Dagre |
| `"circular"` | Nodes arranged in a circle |
| `"concentric"` | Concentric rings ordered by degree |
| `"radial"` | Radial tree from a focal node |
| `"grid"` | Uniform grid |
| `"mds"` | Multi-dimensional scaling |
| `"random"` | Random positions |
| `"snake"` | Snake / serpentine path |
| `"fishbone"` | Fishbone / Ishikawa diagram |

Pass additional layout-specific options (e.g. `rankdir`, `nodesep`) via the
full `options.layout` prop — the `layout` shorthand will still override the
`type`.

---

### Directed graphs

Set `directed={true}` to draw an arrowhead at the **target** end of every
edge, making the graph visually directed:

```tsx
<Graphin data={data} directed layout="dagre" />
```

Fine-grained arrow control is available through
`options.edge.style.endArrow` / `options.edge.style.startArrow`.

---

### Node events

The card dispatches Pihanga actions for four node interactions:

| Prop | Fires when |
|---|---|
| `onNodeHovered` | Pointer enters a node |
| `onNodeHoverEnd` | Pointer leaves a node |
| `onNodeClicked` | Single click on a node |
| `onNodeDblClicked` | Double-click on a node |

Each event receives a `GraphinNodeEventContext` payload:
```ts
type GraphinNodeEventContext = {
  nodeId:    string;
  nodeData?: Record<string, unknown>;
  x:         number; // canvas x of the pointer
  y:         number; // canvas y of the pointer
};
```

### Node styling

Vary color, size, and shape **per node** using `options.node.style` functions
and `options.node.type`.  Each function receives the full node datum, so you
can read any field from `node.data` to drive the visual:

```ts
options: {
  node: {
    // Shape: "circle" (default) | "rect" | "diamond" | "star" | "triangle" | "hexagon"
    type: (d) => d.data?.role === "db" ? "rect" : "circle",

    style: {
      fill:      (d) => d.data?.color ?? "#4793AF",   // fill color
      stroke:    (d) => d.data?.border ?? "#d2dde8",  // border color
      lineWidth: () => 2,                              // border thickness
      size:      (d) => (d.data?.weight as number ?? 1) * 24, // relative size
      labelFill: () => "#fff",                         // label text color
      opacity:   (d) => d.data?.dim ? 0.4 : 1,        // transparency
    },
  },
}
```

See the **Styled nodes** facet for a live example.

---

### Tooltip (hover overlay)

Supply a `tooltip.node` card reference to render a non-interactive floating
card while hovering a node.

### Context panel (click overlay)

Supply a `contextMenu.node` card reference to render an interactive panel
that opens on node click and stays visible until the user clicks **outside**
or presses the built-in **✕ close** button.
