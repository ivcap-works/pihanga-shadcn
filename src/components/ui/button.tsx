import * as React from "react";
import {cva, type VariantProps} from "class-variance-authority";
import {Slot} from "radix-ui";

import {cn} from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Extended variants used by pi/button
        ghost2:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        ghost3:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        ghostActive: "bg-accent text-accent-foreground",
        brand: "bg-primary text-primary-foreground hover:bg-primary/90",
        nav: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        navAction:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        menuAction:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        blockAction:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        blockActionSecondary:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        primaryOutline:
          "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
        radio:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        none: "",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        md: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        iconSm: "size-8",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        navAction: "h-9 px-3",
        menuAction: "h-8 px-3 text-sm",
        blockAction: "h-10 px-4",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/** Extra props accepted by both Button and LinkButton beyond standard HTML/CVA props */
type ButtonExtendedProps = {
  /** Accessible label; maps to aria-label */
  label?: string;
  active?: boolean;
  focused?: boolean;
  isMenu?: boolean;
  truncate?: boolean;
  loading?: boolean;
  isPending?: boolean;
  loadingClassName?: string;
};

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  label,
  active,
  focused,
  isMenu,
  truncate,
  loading,
  isPending,
  loadingClassName: _loadingClassName,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  } & ButtonExtendedProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      aria-label={label}
      data-active={active || undefined}
      data-focused={focused || undefined}
      data-is-menu={isMenu || undefined}
      data-loading={loading || undefined}
      data-pending={isPending || undefined}
      className={cn(
        buttonVariants({variant, size, className}),
        truncate && "truncate",
      )}
      {...props}
    />
  );
}

/** Button rendered as an anchor (`<a>`) element */
function LinkButton({
  className,
  variant = "default",
  size = "default",
  href,
  target,
  label,
  active,
  focused,
  isMenu,
  truncate,
  loading,
  isPending,
  loadingClassName: _loadingClassName,
  onClick,
  children,
  ...props
}: Omit<React.ComponentProps<"a">, "onClick"> &
  VariantProps<typeof buttonVariants> &
  ButtonExtendedProps & {
    href?: string;
    target?: string;
    onClick?: () => void;
  }) {
  return (
    <a
      data-slot="button"
      data-variant={variant}
      data-size={size}
      href={href}
      target={target}
      aria-label={label}
      data-active={active || undefined}
      data-focused={focused || undefined}
      data-is-menu={isMenu || undefined}
      data-loading={loading || undefined}
      data-pending={isPending || undefined}
      className={cn(
        buttonVariants({variant, size, className}),
        truncate && "truncate",
      )}
      onClick={
        onClick
          ? (e) => {
              e.preventDefault();
              onClick();
            }
          : undefined
      }
      {...props}
    >
      {children}
    </a>
  );
}

export {Button, buttonVariants, LinkButton};
