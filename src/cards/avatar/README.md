Displays a user avatar — either an image or a lettered fallback circle.

Built on the [shadcn Avatar](https://ui.shadcn.com/docs/components/avatar)
primitive (Radix UI `Avatar`).

**Graceful degradation:** if `src` is absent or the image fails to load the
`fallback` text (typically one or two initials) is shown inside a muted circle
of the same size.  When neither `src` nor `fallback` is set, the first two
characters of `alt` are used as a last resort.

**Sizes** map to Tailwind `size-*` utilities:

| `size` | Tailwind   | px |
|--------|-----------|-----|
| `"sm"` | `size-6`  | 24 |
| `"md"` | `size-8`  | 32 |
| `"lg"` | `size-12` | 48 |
| `"xl"` | `size-16` | 64 |

Use `className` to add custom styles such as a ring:

```ts
ShadAvatar({ src: url, className: "ring-2 ring-primary ring-offset-2" })
```
