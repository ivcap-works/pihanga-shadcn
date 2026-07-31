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

### Concentric vs Radial

Both draw rings of nodes, but they differ in **what determines ring membership**
and **what sits at the centre**:

| | `"concentric"` | `"radial"` |
|---|---|---|
| Centre determined by | Node with the highest score of `sortBy` (default: degree) | An explicit `focusNode` ID |
| Ring assignment | Score bucketing — nodes are grouped by `maxLevelDiff`-sized score bands | Graph-distance from the focal node — distance-1 neighbours → ring 1, distance-2 → ring 2, … |
| Same-ring ordering | Clockwise/anti-clockwise by insertion order | `sortBy` field or topology (brings cluster-mates together) |
| Focal node default | Highest-degree node ends up in the innermost ring automatically | `null` → the **first node in the data array** |

**Controlling the centre in each layout:**

```ts
// concentric – promote a specific node to the centre by giving it a high sort value
options: {
  layout: {
    type: "concentric",
    sortBy: (node) => node.id === "root" ? 9999 : node.data?.rank as number ?? 0,
  }
}

// radial – name the focal node directly
options: {
  layout: {
    type: "radial",
    focusNode: "root",   // node.id; omit or set null → first node in data[]
    unitRadius: 120,     // px between rings
    sortBy: "cluster",   // keep cluster-mates adjacent on the same ring
  }
}
```

Use **concentric** when you want to surface the most connected hubs
automatically.  Use **radial** when you have a specific root or entry-point
node and want to show how far every other node is from it.

---

### Clustering

Three layouts expose a **first-class `clustering` option** that physically
groups nodes by a data field:

| Layout | Key options |
|---|---|
| `"force"` / `"gforce"` | `clustering`, `leafCluster`, `nodeClusterBy`, `clusterNodeStrength` |
| `"fruchterman"` | `clustering`, `nodeClusterBy`, `clusterGravity` |
| `"d3-force"` | `clustering`, `clusterBy`, `clusterNodeStrength`, `clusterEdgeStrength`, `clusterEdgeDistance`, `clusterFociStrength` |

Set `clustering: true` and point `nodeClusterBy` / `clusterBy` at the field in
`node.data` that identifies each cluster (e.g. `"group"`):

```ts
options: {
  layout: {
    type: "fruchterman",
    clustering: true,
    nodeClusterBy: (node) => node.data?.group as string,
    clusterGravity: 15,  // tighter sub-clusters
  }
}
```

**`force-atlas2`** does not have an explicit clustering flag but its
`mode: "linlog"` uses logarithmic attraction, which naturally pulls densely
connected sub-graphs into tight visible clusters — a good zero-config
alternative when your data already has community structure.

**`radial`** supports `sortBy: "cluster"` (or any node-data field) to arrange
nodes that share a cluster value adjacent to each other on the same ring —
useful for visually hinting at grouping without a full force-based layout.

All other layouts (`dagre`, `antv-dagre`, `circular`, `grid`, `concentric`,
`mds`, `random`, `snake`, `fishbone`) are geometric or hierarchical and do not
have clustering support.

---

### Directed graphs

Set `directed={true}` to draw an arrowhead at the **target** end of every
edge, making the graph visually directed:

```tsx
<Graphin data={data} directed layout="dagre" />
```

#### Reversing the visual arrowhead without changing layout direction

Arrow styles (`startArrow` / `endArrow`) are **pure visual props** — they are
completely independent of the logical `source` → `target` direction that layout
engines use for ranking.

When you set `directed={true}` the card injects `endArrow: true` as a default,
**but only if you have not already set either arrow in `options.edge.style`**.
So to flip the arrowhead, explicitly provide both flags in `options`:

```ts
// Arrow points FROM target TO source — layout direction unchanged
<Graphin
  data={data}
  directed
  layout="dagre"
  options={{
    edge: {
      style: {
        endArrow:   false,  // suppress the default target arrowhead
        startArrow: true,   // add arrowhead at source instead
      },
    },
  }}
/>
```

The edge's `source` / `target` remain unchanged, so `dagre` (and every other
layout) still ranks and routes the graph in the original direction.  Only the
rendered arrowhead moves to the other end.

Per-edge control follows the same pattern via a style function:

```ts
options: {
  edge: {
    style: {
      endArrow:   (edge) => edge.data?.flip ? false : true,
      startArrow: (edge) => edge.data?.flip ? true  : false,
    },
  },
}
```

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

### Node labels

By default every node renders a text label taken from `node.data.displayName`
(falling back to `node.id`).  Two props let you suppress labels without
touching the raw G6 options:

| Prop / field | Scope | Effect |
|---|---|---|
| `showLabels={false}` | card-level | Hides **all** node labels |
| `nodeStyles: { myStyle: { showLabel: false } }` | per-style | Hides labels only for nodes using that style |

Per-style `showLabel` takes precedence over the card-level `showLabels` flag,
so you can hide labels globally but still show them for selected node types:

```ts
// Hide all labels except for gateway nodes
Graphin({
  showLabels: false,
  nodeStyles: {
    gateway: { type: "star", fill: "#e67e22", showLabel: true },
    service: { type: "circle", fill: "#2980b9" }, // hidden — inherits global false
  },
})
```

---

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
