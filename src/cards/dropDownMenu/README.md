A dropdown menu backed by Radix UI's DropdownMenu primitive.

**Supported item types:**

| Type | Behaviour |
|---|---|
| `item` | Regular action with optional keyboard shortcut |
| `checkbox` | Toggleable item with optional keep-open delay |
| `radio-group` | Single-select group |
| `submenu` | Nested menu level |
| `label` | Non-interactive header |
| `separator` | Visual divider |

The `trigger` prop accepts any `PiCardRef` — typically a `Button` card.
