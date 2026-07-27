A minimal card that renders a single named icon (resolved from the pihanga
icon registry) inside a plain `<div>`.

The wrapping div accepts an optional `className` for Tailwind utility classes
and an optional `style` for inline CSS overrides, giving full control over
size, colour, spacing, and layout without any card-specific CSS.

Icons must be registered once in your app (e.g. `app.icons.ts`) via
`registerIcon`, then referenced by the same name string in the card props.
