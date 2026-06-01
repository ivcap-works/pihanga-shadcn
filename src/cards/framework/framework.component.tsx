import * as React from "react";
import {StrictMode} from "react";
import {ThemeProvider} from "@/components/theme-provider/theme-provider.component";

import {Card, type PiCardProps, type WindowProps} from "@pihanga2/core";
import {TooltipProvider} from "@/components/ui/tooltip";

export const Component = (props: PiCardProps<WindowProps>): React.ReactNode => {
  const {page, theme = "dark", cardName} = props;

  return (
    <StrictMode>
      <ThemeProvider defaultTheme={theme} storageKey="shadcn-ui-theme">
        <TooltipProvider>
          <Card cardName={page} parentCard={cardName} />
        </TooltipProvider>
      </ThemeProvider>
    </StrictMode>
  );
};
