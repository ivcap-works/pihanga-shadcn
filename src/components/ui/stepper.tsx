/**
 * Stepper UI primitive — shadcn/Tailwind-based, inspired by MUI Joy UI's Stepper.
 *
 * Architecture
 * ───────────
 * • Tailwind classes handle structural / layout / dimension concerns that are
 *   difficult to override with plain CSS (flex layout, width/height, spacing).
 * • BEM class names (`pi-stepper`, `pi-stepper__*`, `pi-stepper__*--state`)
 *   are applied to every element so consumers can override visual styles
 *   (colours, borders, transitions) in `stepper.css` or any downstream sheet.
 * • Default visual styles live in `src/cards/shadcn/stepper/stepper.css`
 *   (imported by the Pihanga card component).
 */
import * as React from "react";
import {Check} from "lucide-react";
import {cn} from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StepState = "completed" | "active" | "upcoming";

export interface StepData {
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
  /**
   * Optional pre-rendered React node to replace the default title/description
   * label.  Produced by the Pihanga card component when `labelCard` is set on
   * a `StepItem`; rendered via `<Card cardName={step.labelCard} />` there.
   */
  labelNode?: React.ReactNode;
}

export interface StepperUIProps {
  steps: StepData[];
  /** 0-based index of the currently active step */
  activeStep: number;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** If provided, steps become clickable */
  onStepClick?: (stepIndex: number, stepId: string) => void;
  /** Optional content rendered below the label in vertical-mode active steps */
  renderStepContent?: (stepIndex: number, step: StepData) => React.ReactNode;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStepState(stepIndex: number, activeStep: number): StepState {
  if (stepIndex < activeStep) return "completed";
  if (stepIndex === activeStep) return "active";
  return "upcoming";
}

// Tailwind dimension classes for the step-indicator button.
// Kept here so layout always works even without the CSS file loaded.
const INDICATOR_SIZE = {
  sm: {btn: "h-6 w-6 text-xs", icon: "h-3 w-3"},
  md: {btn: "h-8 w-8 text-sm", icon: "h-4 w-4"},
  lg: {btn: "h-10 w-10 text-base", icon: "h-5 w-5"},
} as const;

// Tailwind label font classes — fallback when CSS file is absent.
const LABEL_SIZE = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
} as const;

// ─── Indicator button ─────────────────────────────────────────────────────────

function IndicatorButton({
  state,
  stepIndex,
  size,
  onClick,
}: {
  state: StepState;
  stepIndex: number;
  size: "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const s = INDICATOR_SIZE[size];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-current={state === "active" ? "step" : undefined}
      className={cn(
        // ── BEM — visual override target ──
        "pi-stepper__indicator",
        `pi-stepper__indicator--${state}`,
        onClick
          ? "pi-stepper__indicator--clickable"
          : "pi-stepper__indicator--static",
        // ── Tailwind — structural defaults (always applied) ──
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        s.btn,
        // Default visual appearance via Tailwind (overridden by stepper.css rules)
        state === "completed" && "bg-primary text-primary-foreground",
        state === "active" &&
          "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
        state === "upcoming" &&
          "border-2 border-muted-foreground/40 bg-background text-muted-foreground",
        onClick && "cursor-pointer hover:opacity-80",
        !onClick && "cursor-default",
      )}
    >
      {state === "completed" ? (
        <Check
          className={cn("pi-stepper__indicator-icon", s.icon)}
          strokeWidth={2.5}
        />
      ) : (
        <span className="pi-stepper__indicator-label">{stepIndex + 1}</span>
      )}
    </button>
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────

function StepLabel({
  step,
  state,
  size,
  vertical = false,
}: {
  step: StepData;
  state: StepState;
  size: "sm" | "md" | "lg";
  vertical?: boolean;
}) {
  // Custom card label takes precedence over the default text label.
  if (step.labelNode != null) {
    return (
      <div
        className={cn(
          "pi-stepper__label-card",
          `pi-stepper__label-card--${state}`,
          vertical && "pi-stepper__label-card--vertical",
          // Tailwind defaults
          vertical ? "ml-4" : "mt-2 text-center",
        )}
      >
        {step.labelNode}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pi-stepper__label",
        `pi-stepper__label--${state}`,
        vertical && "pi-stepper__label--vertical",
        // Tailwind defaults
        vertical ? "ml-4" : "mt-2 text-center",
        !vertical && "max-w-[96px]",
      )}
    >
      <p
        className={cn(
          "pi-stepper__label-title",
          `pi-stepper__label-title--${state}`,
          // Tailwind defaults
          LABEL_SIZE[size],
          "font-medium leading-tight",
          state === "upcoming" ? "text-muted-foreground" : "text-foreground",
          vertical && "leading-none",
        )}
      >
        {step.title}
        {vertical && step.optional && (
          <span className="pi-stepper__label-optional ml-1 text-xs font-normal text-muted-foreground">
            (Optional)
          </span>
        )}
      </p>

      {!vertical && step.optional && (
        <p className="pi-stepper__label-optional text-xs font-normal text-muted-foreground">
          Optional
        </p>
      )}

      {step.description && (
        <p className="pi-stepper__label-description mt-0.5 text-xs text-muted-foreground">
          {step.description}
        </p>
      )}
    </div>
  );
}

// ─── Horizontal layout ────────────────────────────────────────────────────────

function HorizontalStepper({
  steps,
  activeStep,
  size = "md",
  className,
  onStepClick,
}: StepperUIProps) {
  return (
    <ol
      aria-label="Steps"
      className={cn(
        "pi-stepper pi-stepper--horizontal",
        `pi-stepper--${size}`,
        "flex w-full items-start",
        className,
      )}
    >
      {steps.map((step, index) => {
        const state = getStepState(index, activeStep);
        const isFirst = index === 0;
        const isLast = index === steps.length - 1;

        const leftCompleted =
          !isFirst && getStepState(index - 1, activeStep) === "completed";
        const rightCompleted = !isLast && state === "completed";

        return (
          <li
            key={step.id}
            className={cn(
              "pi-stepper__step",
              `pi-stepper__step--${state}`,
              isFirst && "pi-stepper__step--first",
              isLast && "pi-stepper__step--last",
              "flex flex-1 flex-col items-center",
            )}
          >
            {/* ── [left-half] [indicator] [right-half] centred row ── */}
            <div className="flex w-full items-center">
              {isFirst ? (
                <div className="flex-1" aria-hidden="true" />
              ) : (
                <div
                  className={cn(
                    "pi-stepper__connector pi-stepper__connector--left",
                    leftCompleted
                      ? "pi-stepper__connector--completed"
                      : "pi-stepper__connector--upcoming",
                    // Tailwind defaults
                    "h-0.5 flex-1 transition-colors duration-300",
                    leftCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              )}

              <IndicatorButton
                state={state}
                stepIndex={index}
                size={size}
                onClick={
                  onStepClick ? () => onStepClick(index, step.id) : undefined
                }
              />

              {isLast ? (
                <div className="flex-1" aria-hidden="true" />
              ) : (
                <div
                  className={cn(
                    "pi-stepper__connector pi-stepper__connector--right",
                    rightCompleted
                      ? "pi-stepper__connector--completed"
                      : "pi-stepper__connector--upcoming",
                    // Tailwind defaults
                    "h-0.5 flex-1 transition-colors duration-300",
                    rightCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>

            <StepLabel step={step} state={state} size={size} vertical={false} />
          </li>
        );
      })}
    </ol>
  );
}

// ─── Vertical layout ──────────────────────────────────────────────────────────

function VerticalStepper({
  steps,
  activeStep,
  size = "md",
  className,
  onStepClick,
  renderStepContent,
}: StepperUIProps) {
  return (
    <ol
      className={cn(
        "pi-stepper pi-stepper--vertical",
        `pi-stepper--${size}`,
        "flex flex-col",
        className,
      )}
    >
      {steps.map((step, index) => {
        const state = getStepState(index, activeStep);
        const isFirst = index === 0;
        const isLast = index === steps.length - 1;
        const content =
          state === "active" && renderStepContent
            ? renderStepContent(index, step)
            : null;

        return (
          <li
            key={step.id}
            className={cn(
              "pi-stepper__step",
              `pi-stepper__step--${state}`,
              isFirst && "pi-stepper__step--first",
              isLast && "pi-stepper__step--last",
              "flex",
            )}
          >
            {/* Left col: indicator + connector */}
            <div className="flex flex-col items-center">
              <IndicatorButton
                state={state}
                stepIndex={index}
                size={size}
                onClick={
                  onStepClick ? () => onStepClick(index, step.id) : undefined
                }
              />
              {!isLast && (
                <div
                  className={cn(
                    "pi-stepper__connector pi-stepper__connector--vertical",
                    state === "completed"
                      ? "pi-stepper__connector--completed"
                      : "pi-stepper__connector--upcoming",
                    // Tailwind defaults
                    "mb-1 mt-1 w-0.5 flex-1 transition-colors duration-300",
                    state === "completed" ? "bg-primary" : "bg-border",
                  )}
                  style={{minHeight: "24px"}}
                />
              )}
            </div>

            {/* Right col: label + content */}
            <div className={cn("flex-1", !isLast && "pb-6")}>
              <StepLabel
                step={step}
                state={state}
                size={size}
                vertical={true}
              />
              {content && (
                <div className="pi-stepper__step-content ml-4 mt-3">
                  {content}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function StepperUI(props: StepperUIProps) {
  return props.orientation === "vertical" ? (
    <VerticalStepper {...props} />
  ) : (
    <HorizontalStepper {...props} />
  );
}
