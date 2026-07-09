A slide-in drawer panel backed by the [Vaul](https://github.com/emilkowalski/vaul) library (the same primitive used by shadcn/ui's Drawer component).

**Usage modes:**

| Mode | How to open |
|---|---|
| Trigger | Pass a `trigger` card — drawer opens on interaction |
| Controlled | Pass `open` prop + handle `onClosed` to manage from state |

Supports four slide directions (`bottom`, `top`, `left`, `right`), optional
header (title + description), optional custom footer card or a default close
button, and programmatic open/close via the `open` prop.
