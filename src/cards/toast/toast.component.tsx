import React, {useEffect, useRef, useState} from "react";
import {
  Card,
  type PiCardProps,
  type PiCardRef,
  usePiReducer,
  type ReduxAction,
  type ReduxState,
} from "@pihanga2/core";
import {toast} from "sonner";

import {
  ShowToastEvent,
  TOAST_OP_ACTION,
  ToastPosition,
  ToastType,
  type PiToastEvents,
  type PiToastProps,
} from "./toast.types";

export const ToastComponent = (
  props: PiCardProps<PiToastProps, PiToastEvents>,
): React.ReactNode => {
  const {
    variant: defaultVariant = "default",
    duration: defaultDuration = 4000,
    dismissible: defaultDismissible = true,
    className: defaultClassName,
    onClosed,
    cardName,
  } = props;

  // State for tracking Redux-triggered toast messages
  const [currentToast, setCurrentToast] = useState<{
    message?: string;
    description?: string;
    contentCard?: PiCardRef;
    variant: ToastType;
    position?: ToastPosition;
    duration: number;
  } | null>(null);

  // Listen for showToast Redux messages
  // This allows triggering toasts from anywhere via dispatchShowToast
  usePiReducer<ReduxState, ShowToastEvent & ReduxAction>(
    TOAST_OP_ACTION.SHOW,
    (_, action) => {
      // Only respond if message is for this card or no specific cardName is set
      if (action.cardName && action.cardName !== cardName) {
        return;
      }
      setCurrentToast({
        message: action.message,
        description: action.description,
        contentCard: action.contentCard,
        variant: action.variant ?? defaultVariant,
        position: action.position,
        duration: action.duration ?? defaultDuration,
      });
    },
    cardName,
  );

  // Setup hooks before conditional rendering
  const toastIdRef = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    // Only show toast if Redux message was received
    if (!currentToast) {
      return;
    }

    // Map our toast types to Sonner's toast function
    const toastFn =
      {
        success: toast.success,
        error: toast.error,
        info: toast.info,
        warning: toast.warning,
        default: toast,
      }[currentToast.variant] || toast;

    // Build className: combine default + variant-based class
    const className = [defaultClassName, `toast-${currentToast.variant}`]
      .filter(Boolean)
      .join(" ");

    // If contentCard is provided, render it as custom JSX content
    if (currentToast.contentCard) {
      const contentCard = currentToast.contentCard;
      const CustomToastContent = () => (
        <Card cardName={contentCard} parentCard={cardName} />
      );

      // Show the toast with custom card content
      toastIdRef.current = toastFn(CustomToastContent, {
        duration: currentToast.duration,
        position: currentToast.position || "bottom-right",
        dismissible: defaultDismissible,
        className,
        onDismiss: () => {
          setCurrentToast(null);
          onClosed({});
        },
        onAutoClose: () => {
          setCurrentToast(null);
          onClosed({});
        },
      });
    } else {
      // Show the toast with message and optional description
      toastIdRef.current = toastFn(currentToast.message, {
        description: currentToast.description,
        duration: currentToast.duration,
        position: currentToast.position || "bottom-right",
        dismissible: defaultDismissible,
        className,
        onDismiss: () => {
          setCurrentToast(null);
          onClosed({});
        },
        onAutoClose: () => {
          setCurrentToast(null);
          onClosed({});
        },
      });
    }

    // Cleanup on unmount
    return () => {
      if (toastIdRef.current !== undefined) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, [currentToast, defaultDismissible, defaultClassName, onClosed, cardName]);

  // This component doesn't render visible DOM itself
  // Sonner renders toasts in a portal via its Toaster component
  return <div data-pihanga={cardName} style={{display: "none"}} />;
};
