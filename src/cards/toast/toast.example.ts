import {Toast, onShowToast, onPiToastClosed, type PiToastProps} from "./index";
import {definePlayground} from "@/playground/definePlayground";

/**
 * Toast card configuration
 * Configure default behavior - all toasts are triggered via Redux messages
 */
export const successToastConfig = Toast({
  variant: "success",
  duration: 3000,
});

export const errorToastConfig = Toast({
  variant: "error",
  duration: 5000,
});

export const infoToastConfig = Toast({
  variant: "info",
  duration: 4000,
});

/**
 * Example: Dispatch a success toast
 * Usage: dispatchShowToast(_dispatch, successToastPayload)
 */
export const successToastPayload = {
  message: "Operation successful!",
  description: "Your changes have been saved.",
  type: "success" as const,
  duration: 3000,
};

/**
 * Example: Dispatch an error toast
 */
export const errorToastPayload = {
  message: "An error occurred",
  description: "Please try again later.",
  type: "error" as const,
  duration: 5000,
};

/**
 * Example: Dispatch an info toast that doesn't auto-close
 */
export const infoToastPayload = {
  message: "This is an information message",
  type: "info" as const,
  duration: Infinity,
};

/**
 * Example: Dispatch a warning toast
 */
export const warningToastPayload = {
  message: "Warning: This action cannot be undone.",
  type: "warning" as const,
  duration: 4000,
};

/**
 * Example: Basic toast with just a message
 */
export const basicToastPayload = {
  message: "This is a simple notification",
};

// ============================================================================
// Playground definition
// ============================================================================

export default definePlayground<PiToastProps>({
  cardId: "pi/toast",
  title: "Toast",

  introduction: `
A non-blocking toast notification system backed by \`sonner\`.

Toasts are shown **imperatively** via \`dispatchShowToast(dispatch, event)\` from any
Pihanga event handler. Register the Toast card in your layout tree **once**
(typically alongside \`PageWithNavbar\`) to enable toast display globally.

Supports \`success\`, \`error\`, \`info\`, \`warning\`, and \`default\` variants.
  `.trim(),

  preview: (props) => Toast(props),

  defaultProps: {
    variant: "default",
    duration: 4000,
    dismissible: true,
  },

  facets: [
    {
      id: "success",
      title: "Success",
      description: "Green toast for successful operations.",
      props: {variant: "success", duration: 3000},
    },
    {
      id: "error",
      title: "Error",
      description: "Red toast for failures and errors.",
      props: {variant: "error", duration: 5000},
    },
    {
      id: "info",
      title: "Info",
      description: "Blue informational toast.",
      props: {variant: "info", duration: 4000},
    },
    {
      id: "warning",
      title: "Warning",
      description: "Amber toast for cautions and warnings.",
      props: {variant: "warning", duration: 4000},
    },
    {
      id: "persistent",
      title: "Persistent",
      description:
        "Set `duration: Infinity` to keep the toast visible until manually dismissed.",
      props: {variant: "info", duration: Infinity, dismissible: true},
    },
  ],

  controls: [
    {
      prop: "variant",
      type: "token",
      label: "Default variant",
      options: ["default", "success", "error", "info", "warning"],
    },
    {prop: "dismissible", type: "boolean", label: "Dismissible"},
  ],

  registerEvents: (r, logEvent) => {
    // Fires whenever a toast is dispatched anywhere in the app.
    onShowToast(r, (state, ev) => {
      logEvent(state, "onShowToast", {
        message: ev.message,
        variant: ev.variant,
        duration: ev.duration,
        position: ev.position,
      });
    });
    // Fires when the user dismisses (or the timer closes) a toast.
    onPiToastClosed(r, (state, ev) => {
      logEvent(state, "onPiToastClosed", {id: ev.id});
    });
  },

  note: `
**Register the Toast card once** in your layout (e.g. in \`PageWithNavbar\`'s
\`extraCards\` or as a sibling in your root stack):

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {Toast} from "@/cards/toast";

registerCard("app/toast", Toast({
  variant:     "default",
  duration:    4000,
  dismissible: true,
}));
\`\`\`

**Dispatch a toast from any event handler:**

\`\`\`ts
import {register} from "@pihanga2/core";
import {dispatchShowToast, onSomeAction} from "@/cards/toast";

register((r) => {
  onSomeAction(r, (state, action, dispatch) => {
    dispatchShowToast(dispatch, {
      message:     "Saved!",
      description: "Your changes have been persisted.",
      variant:     "success",
      duration:    3000,
    });
  });
});
\`\`\`
  `.trim(),
});
