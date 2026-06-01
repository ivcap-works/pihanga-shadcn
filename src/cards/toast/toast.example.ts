import {Toast} from "./toast.types";

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
