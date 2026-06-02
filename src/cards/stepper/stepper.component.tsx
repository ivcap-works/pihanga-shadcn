import React, {useState} from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {StepperUI, type StepData} from "@/components/ui/stepper";
import type {StepperEvents, StepperProps} from "./stepper.types";
// Default visual styles — import before component renders so BEM classes are styled.
// Override by targeting the same class names in a stylesheet loaded after this one.
import "./stepper.css";

export const StepperComponent = (
  props: PiCardProps<StepperProps, StepperEvents>,
): React.ReactNode => {
  const {
    steps,
    activeStep: propActiveStep,
    defaultActiveStep = 0,
    selfManaged = false,
    orientation = "horizontal",
    size = "md",
    showContent = false,
    className,
    cardName,
    onStepClicked,
  } = props;

  // Internal state used only when selfManaged=true.
  // Initialised from propActiveStep (if given) or defaultActiveStep.
  const [managedStep, setManagedStep] = useState<number>(
    propActiveStep ?? defaultActiveStep,
  );

  // Resolve the effective active step:
  //   - selfManaged  → use internal state
  //   - controlled   → use the prop (fall back to 0 if not set)
  const activeStep = selfManaged ? managedStep : (propActiveStep ?? 0);

  // Map StepItem[] → StepData[] (UI primitive only needs serialisable fields
  // plus an optional pre-rendered React node for custom labels).
  const stepData: StepData[] = steps.map((step) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    optional: step.optional,
    // If a labelCard is specified, render it here and pass as `labelNode`.
    // The UI primitive will display it instead of the default title/description.
    labelNode: step.labelCard ? (
      <Card cardName={step.labelCard} parentCard={cardName} />
    ) : undefined,
  }));

  function handleStepClick(stepIndex: number, stepId: string) {
    if (selfManaged) {
      setManagedStep(stepIndex);
    }
    // Dispatch Pihanga event when the callback is wired (it may be absent for
    // inline / anonymous card declarations that have no registered reducer).
    if (typeof onStepClicked === "function") {
      onStepClicked({stepIndex, stepId});
    }
  }

  /**
   * Render a card ref for the active step's content (vertical mode only).
   * We look up the original `steps` array to get the `contentCard` reference.
   */
  function renderStepContent(stepIndex: number): React.ReactNode {
    if (!showContent || orientation !== "vertical") return null;
    const step = steps[stepIndex];
    if (!step?.contentCard) return null;
    return <Card cardName={step.contentCard} parentCard={cardName} />;
  }

  return (
    <div data-pihanga={cardName}>
      <StepperUI
        steps={stepData}
        activeStep={activeStep}
        orientation={orientation}
        size={size}
        className={className}
        onStepClick={handleStepClick}
        renderStepContent={renderStepContent}
      />
    </div>
  );
};
