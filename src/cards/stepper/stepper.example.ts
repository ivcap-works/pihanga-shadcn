import {definePlayground} from "@/playground/definePlayground";
import {Stepper, onStepperStepClicked, type StepperProps} from "./index";

export default definePlayground<StepperProps>({
  cardId: "shad/stepper",
  title: "Stepper",

  preview: (props) => Stepper(props),

  defaultProps: {
    selfManaged: true,
    orientation: "horizontal",
    steps: [
      {id: "account", title: "Account", description: "Create your account"},
      {id: "profile", title: "Profile", description: "Set up your profile"},
      {id: "review", title: "Review", description: "Review and confirm"},
    ],
  },

  facets: [
    {
      id: "self-managed",
      title: "Self-managed",
      description: "Component tracks its own active step. No reducer required.",
      props: {
        selfManaged: true,
        orientation: "horizontal",
        steps: [
          {id: "account", title: "Account", description: "Create your account"},
          {id: "profile", title: "Profile", description: "Set up your profile"},
          {id: "review", title: "Review", description: "Review and confirm"},
        ],
      },
    },
    {
      id: "controlled",
      title: "Controlled",
      description:
        "Active step is driven by `activeStep` from state. Wire a reducer to onStepClicked.",
      props: {
        selfManaged: false,
        activeStep: 1,
        steps: [
          {id: "cart", title: "Cart", description: "Review items"},
          {
            id: "ship",
            title: "Shipping",
            description: "Choose method",
            optional: true,
          },
          {id: "pay", title: "Payment", description: "Enter details"},
          {id: "confirm", title: "Confirm", description: "Place order"},
        ],
      },
    },
    {
      id: "vertical",
      title: "Vertical",
      description:
        "Vertical orientation — steps stack top to bottom. Use with showContent for step bodies.",
      props: {
        selfManaged: true,
        orientation: "vertical",
        steps: [
          {id: "details", title: "Personal details"},
          {id: "address", title: "Shipping address"},
          {id: "payment", title: "Payment"},
        ],
      },
    },
  ],

  controls: [
    {prop: "selfManaged", type: "boolean", label: "Self-managed"},
    {
      prop: "orientation",
      type: "token",
      label: "Orientation",
      options: ["horizontal", "vertical"],
    },
    {
      prop: "size",
      type: "token",
      label: "Size",
      options: ["sm", "md", "lg"],
    },
  ],

  registerEvents: (r, logEvent) => {
    // Fires whenever the user clicks a step indicator in the live preview.
    onStepperStepClicked(r, (state, ev) => {
      logEvent(state, "onStepperStepClicked", {
        stepIndex: ev.stepIndex,
        stepId: ev.stepId,
      });
    });
  },

  note: `
**Self-managed** — no reducer needed:

\`\`\`ts
import {registerCard} from "@pihanga2/core";
import {Stepper} from "@/cards/stepper";

registerCard("wizard/stepper", Stepper({
  selfManaged: true,
  steps: [
    {id: "account", title: "Account",  description: "Create your account"},
    {id: "profile", title: "Profile",  description: "Set up your profile"},
    {id: "review",  title: "Review",   description: "Review and confirm"},
  ],
}));
\`\`\`

**Controlled** — active step driven by state:

\`\`\`ts
import {registerCard, memo, register} from "@pihanga2/core";
import {Stepper, onStepperStepClicked} from "@/cards/stepper";
import type {AppState} from "@/app.state";

register((r) => {
  onStepperStepClicked(r, (state: AppState, {stepIndex}) => {
    state.wizard.activeStep = stepIndex;
  });
});

registerCard("wizard/stepper", Stepper({
  activeStep: memo(
    (s: AppState) => s.wizard.activeStep,
    (v) => v ?? 0,
  ),
  steps: [
    {id: "details", title: "Personal details"},
    {id: "address", title: "Shipping address"},
    {id: "payment", title: "Payment"},
  ],
}));
\`\`\`
  `.trim(),
});
