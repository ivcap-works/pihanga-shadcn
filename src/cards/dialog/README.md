A modal / drawer dialog backed by Radix UI's Dialog primitive.

**Usage modes:**

| Mode | How to open |
|---|---|
| Trigger | Pass a `trigger` card — dialog opens on interaction |
| Controlled | Pass `open` prop + handle `onClosed` to manage from state |
| Programmatic | No trigger — open/close purely via the `open` prop |

Supports multiple size variants (`xs` through `4xl`), a responsive drawer
variant on mobile (`mobileVariant: "drawer"`), and optional custom footer
or close-button text.
