import React from "react";
import type {PiCardProps} from "@pihanga2/core";
import type {
  ButtonClickedEvent,
  ButtonEvents,
  ButtonProps,
} from "@pihanga2/cards";
import {Button} from "@/registry/ui/button";
// import { Button, Tooltip } from "@mui/joy"
// import { renderDecorator } from "../utils"
import {Loader2} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/registry/ui/tooltip";
import {clsx} from "clsx";
import {toSize, toVariant} from "./button.util";
import {renderDecorator} from "../decorator";

export function ButtonComponent(
  props: ButtonProps & {
    cardName: string;
    onClicked?: (ev: ButtonClickedEvent) => void;
  },
): React.ReactNode {
  return Component({
    ...props,
    _cls: function (nodeName: string | string[]): string {
      const na: string[] = typeof nodeName === "string" ? [nodeName] : nodeName;
      return na.join(" ");
    },
    _dispatch: function () {
      throw new Error("Function not implemented.");
    },
    onClicked: function (ev: ButtonClickedEvent): void {
      if (props.onClicked) {
        props.onClicked(ev);
      }
    },
  });
}

export const Component = (
  props: PiCardProps<ButtonProps, ButtonEvents>,
): React.ReactNode => {
  const {
    label,
    tooltip,
    isDisabled,
    isLoading,
    loadingPosition = "start",
    size,
    color,
    variant,
    isSubmit,
    isLink,
    startDecorator,
    endDecorator,
    className,
    onClicked,
    cardName,
    _cls,
  } = props;

  // const x = {
  //   variant: {
  //     default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
  //     destructive:
  //       "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  //     outline:
  //       "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
  //     secondary:
  //       "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  //     ghost: "hover:bg-accent hover:text-accent-foreground",
  //     link: "text-primary underline-offset-4 hover:underline",
  //   },
  //   size: {
  //     default: "h-9 px-4 py-2",
  //     sm: "h-8 rounded-md px-3 text-xs",
  //     lg: "h-10 rounded-md px-8",
  //     icon: "h-9 w-9",
  //   },
  // }

  let v = toVariant(variant);
  if (isLink) {
    v = "link";
  } else if (color) {
    // "danger" | "neutral" | "primary" | "success" | "warning"
    switch (color) {
      case "danger":
      case "warning":
        v = "destructive";
    }
  }
  const s = toSize(size);

  const p: React.ComponentProps<typeof Button> = {
    disabled: isDisabled,
    variant: v,
    size: s,
    type: isSubmit ? "submit" : "button",
    onClick,
    // fullWidth,
    className: clsx(_cls("root"), className),
  };

  function onClick() {
    onClicked({});
  }

  const withStartLoader =
    isLoading && (loadingPosition === "start" || loadingPosition === "center");
  const withEndLoader = isLoading && loadingPosition === "end";

  const renderButton = () => (
    <Button {...p} data-pihanga={cardName}>
      {startDecorator && renderDecorator(startDecorator)}
      {withStartLoader && <Loader2 className="animate-spin" />}
      {label}
      {withEndLoader && <Loader2 className="animate-spin" />}
      {endDecorator && renderDecorator(endDecorator)}
    </Button>
  );

  const renderWithTooltip = () => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{renderButton()}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return tooltip ? renderWithTooltip() : renderButton();
};
