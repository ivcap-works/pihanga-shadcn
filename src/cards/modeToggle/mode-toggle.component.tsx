import React from "react";
import {Moon, Sun} from "lucide-react";
import type {PiCardProps} from "@pihanga2/core";
import {Button} from "@/components/ui/button";
import {useTheme} from "@/components/theme-provider";
import type {ModeToggleEvents, ModeToggleProps} from "./mode-toggle.types";

export const ModeToggleComponent = (
  props: PiCardProps<ModeToggleProps, ModeToggleEvents>,
): React.ReactNode => {
  const {setTheme, theme} = useTheme();
  const {variant, className, onModeChanged, cardName} = props;

  function onClick() {
    const mode = theme === "dark" ? "light" : "dark";
    setTheme(mode);
    onModeChanged({mode});
  }

  return (
    <Button
      variant={variant ?? "ghost"}
      size="icon"
      onClick={onClick}
      className={className}
      data-pihanga={cardName}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
