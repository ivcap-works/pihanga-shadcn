import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";

import {cn} from "@/lib/utils";

const sizeClasses: Record<string, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

/** Returns true when the viewport is narrower than `breakpoint` pixels. */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
  );

  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

type DialogVariant = "modal" | "drawer" | "full";

type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root> & {
  /** Desktop-specific variant override (ignored at this layer — consumed by DialogContent). */
  desktopVariant?: DialogVariant;
  /** Mobile-specific variant override (ignored at this layer — consumed by DialogContent). */
  mobileVariant?: DialogVariant;
};

function Dialog({
  desktopVariant: _desktopVariant,
  mobileVariant: _mobileVariant,
  ...props
}: DialogProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

type DialogContentProps = React.ComponentProps<
  typeof DialogPrimitive.Content
> & {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  /**
   * Base variant applied when no responsive override matches.
   * - `modal`  — centred overlay (default)
   * - `drawer` — bottom sheet that slides up
   * - `full`   — full-viewport overlay
   */
  variant?: DialogVariant;
  /**
   * Override variant for desktop viewports (≥ 768 px).
   * Takes precedence over `variant` on desktop.
   */
  desktopVariant?: DialogVariant;
  /**
   * Override variant for mobile viewports (< 768 px).
   * Takes precedence over `variant` on mobile.
   */
  mobileVariant?: DialogVariant;
  dismissible?: boolean;
  hideClose?: boolean;
  fixed?: boolean;
};

function DialogContent({
  className,
  children,
  size = "md",
  variant,
  desktopVariant,
  mobileVariant,
  dismissible = true,
  hideClose = false,
  fixed,
  ...props
}: DialogContentProps) {
  const isMobile = useIsMobile();

  // Resolve the effective variant: responsive override beats base variant.
  const effectiveVariant: DialogVariant =
    (isMobile ? mobileVariant : desktopVariant) ?? variant ?? "modal";

  const isDrawer = effectiveVariant === "drawer";
  const isFull = effectiveVariant === "full";

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-variant={effectiveVariant}
        onInteractOutside={
          dismissible === false ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          dismissible === false ? (e) => e.preventDefault() : undefined
        }
        className={cn(
          // ── Base ──────────────────────────────────────────────────────────
          "bg-card text-card-foreground border border-border",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "fixed z-50 w-full shadow-xl",

          // ── Modal (default) ───────────────────────────────────────────────
          !isDrawer &&
            !isFull &&
            cn(
              "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "rounded-lg",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              sizeClasses[size],
            ),

          // ── Full-screen ───────────────────────────────────────────────────
          isFull &&
            cn(
              "inset-0 translate-x-0 translate-y-0",
              "max-w-none h-full rounded-none",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            ),

          // ── Drawer (bottom sheet) ─────────────────────────────────────────
          isDrawer &&
            cn(
              "bottom-0 left-0 right-0 top-auto",
              "translate-x-0 translate-y-0",
              "max-w-none rounded-t-xl rounded-b-none",
              "data-[state=closed]:slide-out-to-bottom",
              "data-[state=open]:slide-in-from-bottom",
            ),

          // ── Fixed layout (scrollable body, sticky header/footer) ──────────
          fixed && "flex flex-col",
          fixed && !isDrawer && "max-h-[90vh]",
          fixed && isDrawer && "max-h-[85vh]",

          className,
        )}
        {...props}
      >
        {/* Drawer handle */}
        {isDrawer && (
          <div className="mx-auto mt-4 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />
        )}

        {!hideClose && (
          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({className, ...props}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex shrink-0 flex-col gap-2 px-6 pt-6 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DialogBody({className, ...props}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("flex-1 overflow-auto px-6 py-4", className)}
      {...props}
    />
  );
}

function DialogFooter({className, ...props}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex shrink-0 flex-col-reverse gap-2 px-6 pb-6 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
