import {
  createCardDeclaration,
  createOnAction,
  type PiCardRef,
  registerActions,
} from "@pihanga2/core";

export const STEPPER_CARD = "shad/stepper";

export const Stepper = createCardDeclaration<StepperProps, StepperEvents>(
  STEPPER_CARD,
);

export const STEPPER_ACTION = registerActions(STEPPER_CARD, ["stepClicked"]);

export const onStepperStepClicked = createOnAction<StepperStepClickedEvent>(
  STEPPER_ACTION.STEPCLICKED,
);

// ─── Step definition ─────────────────────────────────────────────────────────

/**
 * A single step in the stepper.
 */
export type StepItem = {
  /** Unique identifier used in events. */
  id: string;

  /** Short label shown below/beside the step indicator. */
  title: string;

  /** Optional secondary text shown under the title. */
  description?: string;

  /**
   * If true, an "(Optional)" suffix is appended to the title.
   * Mirrors the MUI Joy UI `optional` prop.
   */
  optional?: boolean;

  /**
   * Optional Pihanga card rendered **instead of** the default title/description
   * text label.  Useful for rich labels (icons, custom markup, etc.).
   * The card receives no extra props — use `memo` in its own declaration if
   * it needs to read from state.
   */
  labelCard?: PiCardRef;

  /**
   * A card ref rendered as the body of this step when it is active
   * and the stepper is in `"vertical"` orientation with `showContent: true`.
   */
  contentCard?: PiCardRef;
};

// ─── Card props ───────────────────────────────────────────────────────────────

export type StepperProps = {
  /** Ordered list of step definitions. */
  steps: StepItem[];

  /**
   * 0-based index of the currently active step (controlled mode).
   * Steps before this index are rendered as "completed";
   * steps after are "upcoming".
   *
   * Required in controlled mode (`selfManaged: false`).
   * Used as the initial value in self-managed mode when provided
   * (otherwise defaults to `defaultActiveStep ?? 0`).
   */
  activeStep?: number;

  /**
   * Initial active step used only in self-managed mode (`selfManaged: true`).
   * Ignored in controlled mode.
   * @default 0
   */
  defaultActiveStep?: number;

  /**
   * When `true`, the component manages its own `activeStep` state internally.
   * Clicking a step immediately advances the indicator without waiting for the
   * host application to update the `activeStep` prop via a reducer.
   * The `onStepClicked` event is still dispatched on each click.
   *
   * When `false` (default), `activeStep` fully controls the display.
   * @default false
   */
  selfManaged?: boolean;

  /**
   * Layout orientation.
   * - `"horizontal"` (default): steps flow left-to-right with labels below.
   * - `"vertical"`: steps stack top-to-bottom with labels/content to the right.
   */
  orientation?: "horizontal" | "vertical";

  /**
   * Visual size of the step indicators.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * When `true` and `orientation === "vertical"`, the active step's
   * `contentCard` is rendered inline beneath its label.
   * @default false
   */
  showContent?: boolean;

  /** Additional Tailwind classes applied to the root element. */
  className?: string;
};

// ─── Events ───────────────────────────────────────────────────────────────────

export type StepperStepClickedEvent = {
  /** 0-based index of the clicked step. */
  stepIndex: number;
  /** The `id` of the clicked step definition. */
  stepId: string;
};

export type StepperEvents = {
  /** Fired when the user clicks on a step indicator. */
  onStepClicked: StepperStepClickedEvent;
};
