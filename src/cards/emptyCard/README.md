An empty-state placeholder card built on the shadcn `Empty` component.

Use `EmptyCard` to fill blank regions of the UI when there is no data to display.
It composes two optional slots:

- **`icon`** — a named icon from the Pihanga icon registry, rendered in a
  rounded `EmptyMedia` badge (`variant="icon"`).
- **`content`** — any Pihanga card reference rendered inside `EmptyContent`.
  Typically a call-to-action button or a short form.

Both slots are optional; omitting them renders a bare empty-state container.
