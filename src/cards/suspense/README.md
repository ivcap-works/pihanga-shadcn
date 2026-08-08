Wraps a card in a React `<Suspense>` boundary so it can suspend and paint
independently of its siblings — useful for code-split cards registered with
`React.lazy`.

| Prop | Default | Purpose |
|---|---|---|
| `content` | — | Card to render inside the Suspense boundary |
| `fallback` | — | Card to show while suspended (overrides the built-in skeleton) |
| `rows` | `3` | Skeleton row count (ignored when `fallback` card is set) |
| `rowSize` | `"md"` | Row height preset: `"xs"` `"sm"` `"md"` `"lg"` `"xl"` |
| `spacing` | `"md"` | Gap between rows: `"sm"` `"md"` `"lg"` |
| `rowClassName` | — | Raw Tailwind override for rows (takes precedence over `rowSize`) |
| `className` | — | Raw Tailwind override for wrapper (takes precedence over `spacing`) |

## Lazy-register a heavy card component

```ts
// myHeavyCard/index.ts
import React from "react";
import {registerCardComponent} from "@pihanga2/core";
import {MY_HEAVY_CARD} from "./myHeavyCard.types";

const MyHeavyComponent = React.lazy(() =>
  import("./myHeavyCard.component").then(m => ({default: m.MyHeavyComponent}))
);

registerCardComponent({ name: MY_HEAVY_CARD, component: MyHeavyComponent });
```

## Wrap it with the suspense card

```ts
import {registerCard} from "@pihanga2/core";
import {PiSuspense} from "@/cards/suspense";

// Default built-in skeleton fallback:
registerCard("myApp/editorSection", PiSuspense({
  content: "myApp/codeEditor",
  rows:    5,
  rowSize: "lg",
}));

// Custom fallback card:
registerCard("myApp/graphSection", PiSuspense({
  content:  "myApp/graphView",
  fallback: "myApp/graphPlaceholder",
}));
```
