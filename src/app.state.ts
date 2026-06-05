import type {ReduxState} from "@pihanga2/core";
import type {PlaygroundState} from "@/playground/playground.state";

export type AppState = ReduxState &
  PlaygroundState & {
    /**
     * Currently active top-level nav page id ("introduction" | "playground").
     * Driven by onPageWithNavbarNavigateTo in app.pihanga.ts.
     * Defaults to "introduction" when undefined.
     */
    currentPage?: string;

    /** 0-based active step for the horizontal stepper demo. */
    stepperActiveStep?: number;
    /** Active tab id for the tabs demo. */
    tabsDemoActiveTab?: string;

    // ── ToggleGroup / Switch wiring demo (app.pihanga.ts) ────────────────────
    /** Currently selected Badge variant driven by the ToggleGroup demo control. */
    demoVariant?: string;
    /** Whether notifications are enabled — driven by the Switch demo control. */
    demoNotifications?: boolean;
  };
