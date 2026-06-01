# Toast Card (`pi/toast`)

A Pihanga card that provides toast notifications using the **Sonner** toast library. Toasts are triggered exclusively via Redux messages with built-in `usePiReducer` support.

## Features

- Multiple toast types: `default`, `success`, `error`, `info`, `warning`
- Redux message-driven (no prop-based content)
- Customizable defaults per card instance (type, duration, dismissible)
- Multiple toast cards supported with cardName-based message filtering
- Event callbacks for when toast is closed
- Full TypeScript support with professional dispatch helpers

## Props (Defaults Only)

### `PiToastProps`

```typescript
{
  // All optional - these are defaults used by this card instance
  variant?: ToastType;          // Default toast variant (default: 'default')
  duration?: number;            // Default duration in ms (default: 4000)
  dismissible?: boolean;        // Default dismissible state (default: true)
  className?: string;           // CSS class to apply to toasts
}
```

**Important:** Message and description come ONLY via Redux messages, not props.

## Events

### `onClosed`

Fired when the toast is dismissed or auto-closes.

```typescript
{
  id?: string;  // The toast's ID if provided in the message
}
```

## Redux Message Interface

All toast content is delivered via `ShowToastEvent`:

```typescript
export type ShowToastEvent = {
  cardName?: string;            // Optional: target specific toast card
  message: string;              // Required: main message
  description?: string;         // Optional: secondary text
  contentCard?: PiCardRef;      // Optional: custom card for rich content
  variant?: ToastType;          // Optional: override default variant
  position?: ToastPosition;     // Optional: toast position on screen
  duration?: number;            // Optional: override default duration
};
```

## Professional Support Functions

### `dispatchShowToast(dispatch, event)`

Dispatch a toast message with full type safety:

```typescript
import {dispatchShowToast} from "@/cards/toast";

dispatchShowToast(_dispatch, {
  message: "Success!",
  description: "Your changes were saved.",
  variant: "success",
  duration: 3000,
});
```

### `onShowToast`

Handle toast show events in reducers:

```typescript
import {onShowToast} from "@/cards/toast";

export const handleShowToast = onShowToast((state, action) => {
  console.log("Toast shown:", action.payload.message);
  return state;
});
```

---

## Declarative Usage Patterns

### Pattern 1: Single Toast Card (Simple)

Register one toast for all notifications:

```typescript
// src/pages/myFeature/myFeature.pihanga.ts
import {registerCard} from "@pihanga2/core";
import {Toast} from "@/cards/toast";

registerCard("myFeature/toast", Toast({
  variant: "default",
  duration: 4000,
}));

registerCard("myFeature/page", PageWithNavbar({
  main: Stack({
    items: [
      "myFeature/mainContent",
      "myFeature/toast",  // Unique card name
    ],
  }),
}));
```

**Dispatch to this toast:**

```typescript
dispatchShowToast(_dispatch, {
  message: "Operation completed",
  variant: "success",
  duration: 3000,
});
```

### Pattern 2: Multiple Toast Cards (Different Defaults)

Register separate toasts for different notification behaviors:

```typescript
// Each card has a unique name for message filtering
registerCard("myFeature/successToast", Toast({
  variant: "success",
  duration: 3000,      // Auto-dismiss quickly
}));

registerCard("myFeature/errorToast", Toast({
  variant: "error",
  duration: Infinity,  // Persistent - requires manual dismiss
}));

registerCard("myFeature/infoToast", Toast({
  variant: "info",
  duration: 5000,
}));

// Add all to layout
registerCard("myFeature/page", PageWithNavbar({
  main: Stack({
    items: [
      "myFeature/mainContent",
      "myFeature/successToast",  // Position 1
      "myFeature/errorToast",    // Position 2
      "myFeature/infoToast",     // Position 3
    ],
  }),
}));
```

**Dispatch to specific toasts using `cardName`:**

```typescript
// Target error toast specifically
dispatchShowToast(_dispatch, {
  message: "Operation failed",
  description: "Please try again.",
  cardName: "myFeature/errorToast",  // Only this card displays
  duration: 5000,
});

// Target success toast
dispatchShowToast(_dispatch, {
  message: "Saved successfully!",
  cardName: "myFeature/successToast",
  duration: 3000,
});

// Broadcast to all (first matching variant displays)
dispatchShowToast(_dispatch, {
  message: "This goes to any available toast",
  variant: "info",
  // No cardName = broadcast mode
});
```

### Message Filtering Logic

Each toast card instance:
1. Gets registered with a **unique cardName** (e.g., `"myFeature/errorToast"`)
2. Listens for "showToast" Redux messages via `usePiReducer`
3. Only displays if:
   - Message has no `cardName` (broadcast mode), OR
   - Message `cardName` matches this card's unique name

**Best Practice:** Always specify `cardName` when using multiple toasts to target the correct card.

---

## Toast Types and Styling

Each toast type uses Sonner's built-in styling AND gets a variant-based CSS class:

- **`default`**: Standard neutral toast → class: `toast-default`
- **`success`**: Green checkmark styling → class: `toast-success`
- **`error`**: Red styling → class: `toast-error`
- **`info`**: Blue styling → class: `toast-info`
- **`warning`**: Orange/yellow styling → class: `toast-warning`

### Custom Styling

You can customize toast appearance using the variant-based CSS classes. Add styles to your CSS file:

```css
/* Style error toasts with a red background */
.toast-error {
  background-color: #fee2e2 !important;
  border: 1px solid #fecaca !important;
  color: #991b1b !important;
}

.toast-error svg {
  color: #dc2626 !important;
}

/* Style success toasts */
.toast-success {
  background-color: #dcfce7 !important;
  border: 1px solid #bbf7d0 !important;
  color: #166534 !important;
}

/* Style warning toasts */
.toast-warning {
  background-color: #fef3c7 !important;
  border: 1px solid #fcd34d !important;
  color: #92400e !important;
}
```

Alternatively, pass custom classes via the toast card props:

```typescript
registerCard("myFeature/errorToast", Toast({
  variant: "error",
  className: "custom-error-toast",
}));
```

Then style it:

```css
.custom-error-toast {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%) !important;
}
```

## Sonner Features

Since this card uses Sonner under the hood, you also get:

- Smooth animations
- Multiple toasts stacking
- Auto-dismiss with progress bar
- Toast action buttons (via Sonner's native API)
- Dark mode support

## How It Works

The toast card integrates with Sonner by:

1. Using `usePiReducer` to listen for "showToast" Redux messages
2. Filtering messages by cardName (if specified)
3. Rendering the toast via Sonner's `toast()` function
4. Storing the toast ID in a ref for cleanup
5. Calling `onClosed` callback when dismissed or auto-closed
6. Cleaning up the toast on component unmount

The component renders an invisible `<div>` since Sonner renders toasts in a portal outside the normal DOM tree.

## Installation Note

Sonner (`^2.0.5`) is already installed in this project. Ensure the `<Toaster />` component is rendered at the root of your app:

```tsx
import {Toaster} from "sonner";

export function App() {
  return (
    <>
      <YourAppContent />
      <Toaster />
    </>
  );
}
```

Check your main app component to ensure the Toaster is present.

## Related Files

- `toast.types.ts` - Type definitions, action wiring, dispatch helpers
- `toast.component.tsx` - React component implementation
- `toast.example.ts` - Configuration and payload examples
- `index.ts` - Card registration
