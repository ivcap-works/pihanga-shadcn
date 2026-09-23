Displays a single conversational message surface — chat text, quoted
replies, suggestions, or reactions.

Built on the [shadcn Bubble](https://ui.shadcn.com/docs/components/base/bubble)
primitive (`Bubble`, `BubbleContent`, `BubbleReactions`).

`Bubble` is intentionally scoped to the message surface itself. For a full
message row with avatar, sender name, and footer metadata, wrap it in a
`shad/message` card.

## Content

- **`text`** — plain string content (the common case).
- **`contentCard`** — any Pihanga card reference rendered instead of `text`.
  Use this for **"large" pieces of content** — e.g. a `markdown-viewer` card
  for rendered Markdown/code, a `shad/data-table`, or an image. Pair it with
  `variant: "ghost"` so the content isn't framed and can use the bubble's
  full available width.

## Variants

`"default"` | `"secondary"` | `"muted"` | `"tinted"` | `"outline"` |
`"ghost"` | `"destructive"`

`"ghost"` renders unframed content — ideal for assistant text, markdown, and
code that shouldn't look like a chat bubble.

## Alignment

Set `align: "end"` for the current user's messages (right-hand side);
`"start"` (default) for the other party.

## Interactive bubbles

- Set `href` to render `BubbleContent` as an anchor.
- Set `clickable: true` (without `href`) to render it as a `<button>` that
  fires `onClicked` with the bubble's `id`.

## Reactions

- **`reactions`** — a plain array of emoji/strings shown overlapping the
  bubble edge.
- **`reactionsCard`** — a Pihanga card reference for interactive reaction
  buttons instead.
- **`reactionsAriaLabel`** — sets `role="img"` + `aria-label` on the row so
  screen readers announce it once instead of glyph-by-glyph.

## Grouping

Use `shad/bubble-group` to stack consecutive bubbles from the same sender
(e.g. several short assistant messages sent in quick succession):

```ts
import {BubbleGroup} from "@/cards/bubble";

registerCard("myApp/assistantBurst", BubbleGroup({
  content: ["myApp/reply1", "myApp/reply2"],
}));
```
