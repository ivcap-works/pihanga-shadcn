# Pihanga Dialog Card

A declarative dialog/modal component for Pihanga, wrapping shadcn's Dialog component (based on Radix UI).

## Features

- **Trigger & Content as Cards**: Both trigger and content are Pihanga card references
- **Programmatic Control**: Supports controlled `open` state for programmatic show/hide
- **Rich Events**: Emits `onOpened`, `onClosed`, and `onOpenChanged` events
- **Close Reason Tracking**: Know if dialog was closed by user or programmatically
- **Responsive Variants**: Support for modal, drawer, and full-screen modes
- **Mobile-Friendly**: Separate desktop/mobile variants
- **Accessible**: Built on Radix UI primitives

## Basic Usage

```ts
import {Dialog} from "@/cards/dialog";
import {Button} from "@/cards/button";

const myDialog = Dialog({
  trigger: Button({
    label: "Open Dialog",
    opts: {variant: "default"},
  }),
  content: myContentCard, // Any PiCardRef
  title: "My Dialog",
  description: "Dialog description text",
  size: "md",
});
```

## Programmatic Control

For dialogs that need to be opened/closed programmatically:

```ts
// In your state/reducer:
const [dialogOpen, setDialogOpen] = useState(false);

const myDialog = Dialog({
  id: "my-dialog",
  open: dialogOpen, // Controlled externally
  trigger: myTriggerButton,
  content: myContentCard,
  title: "Controlled Dialog",
});

// Listen to close events:
import {onDialogClosed} from "@/cards/dialog";

onDialogClosed((ev) => {
  if (ev.id === "my-dialog") {
    console.log("Close reason:", ev.reason); // 'user' or 'programmatic'
    setDialogOpen(false);
  }
});

// Open programmatically:
setDialogOpen(true);
```

## Props

### Required

- `content`: PiCardRef - Card to render as the dialog body

### Optional

- `trigger?: PiCardRef` - Card to render as the trigger (e.g., a button). When omitted, dialog must be controlled via `open` prop

- `id?: string` - Identifier passed to events
- `title?: string` - Dialog title (shown in header)
- `description?: string` - Dialog description (shown in header)
- `open?: boolean` - Controlled open state (for programmatic control)
- `size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"` - Dialog size
- `variant?: "modal" | "drawer" | "full"` - Dialog variant
- `desktopVariant?: "modal" | "drawer" | "full"` - Desktop-specific variant
- `mobileVariant?: "modal" | "drawer" | "full"` - Mobile-specific variant
- `dismissible?: boolean` - Whether clicking outside closes (default: true)
- `hideClose?: boolean` - Hide the X close button (default: false)
- `className?: string` - Additional CSS classes
- `footer?: PiCardRef` - Custom footer card (takes precedence over default close button)
- `footerCloseButtonText?: string | null` - Text for default close button (default: "Close", set to `null` to hide)

## Events

### onOpened
Fired when dialog opens.

**Payload:**
```ts
{
  id?: string;
}
```

### onClosed
Fired when dialog closes.

**Payload:**
```ts
{
  id?: string;
  reason?: "user" | "programmatic"; // How it was closed
}
```

### onOpenChanged
Fired on any open state change.

**Payload:**
```ts
{
  open: boolean;
  id?: string;
}
```

## Examples

See `dialog.example.ts` for complete examples including:
- Simple uncontrolled dialog
- Controlled dialog with programmatic open/close
- Full-screen dialog
- Drawer variant
- Non-dismissible dialog

## Implementation Notes

- The trigger is wrapped in a `<span>` element so Radix can attach handlers via `asChild`
- Supports both controlled (external `open` state) and uncontrolled (internal state) modes
- When controlled, the component tracks close reason (user vs programmatic)
- The dialog component is responsive and uses the shadcn Dialog implementation
