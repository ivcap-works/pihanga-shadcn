import {registerIcon} from "@/cards/icons";
import {MoreHorizontalIcon, Settings, Heart} from "lucide-react";

import {Button, onButtonClicked, type PiButtonProps} from "./index";
import {definePlayground} from "@/playground/definePlayground";

// Example icon registration (usually done once during app init)
registerIcon("more", MoreHorizontalIcon);
registerIcon("settings", Settings);
registerIcon("heart", Heart);

/**
 * Example: Icon-only button using iconLabel.
 *
 * The `iconLabel` prop allows you to specify an icon name (registered via src/pihanga/icons.ts)
 * as the main button content. This is ideal for icon-only buttons where the icon is the
 * primary visual element.
 *
 * Notes:
 * - `iconLabel` takes precedence over `label` and `contentCard`
 * - Use `ariaLabel` to provide accessible text for screen readers
 * - Use `opts.size: 'icon'` for a square icon button
 */
export const examplePiIconButtonProps: PiButtonProps = {
  id: "settings",
  iconLabel: "settings",
  ariaLabel: "Open settings",
  tooltip: "Settings",
  opts: {
    variant: "ghost",
    size: "icon",
  },
};

/**
 * Example: Button with icon label and text combined using beforeIcon.
 *
 * For buttons that need both an icon and text, use `beforeIcon` or `afterIcon`
 * with a text `label` instead of `iconLabel`.
 */
export const examplePiButtonProps: PiButtonProps = {
  id: "example",
  label: "More options",
  tooltip: "More actions",
  opts: {
    variant: "ghost",
    size: "default",
    beforeIcon: "more",
  },
};

/**
 * Letter-avatar style button using PiButton (no dedicated AvatarButton component needed).
 *
 * Notes:
 * - `label` is the visible single-letter.
 * - `ariaLabel` provides an accessible name.
 * - `opts.size: 'icon'` gives a square button; `rounded-full` makes it circular.
 */
export const examplePiAvatarLetterButtonProps: PiButtonProps = {
  id: "user-menu",
  label: "A",
  ariaLabel: "Open account menu",
  tooltip: "Account",
  opts: {
    variant: "secondary",
    size: "icon",
    truncate: false,
  },
  className: "rounded-full font-semibold",
};

/**
 * Example showing tooltip placement options.
 *
 * The `tooltipPlacement` prop controls where the tooltip appears relative to the button:
 * - 'top': Tooltip appears above the button (default)
 * - 'right': Tooltip appears to the right of the button
 * - 'bottom': Tooltip appears below the button
 * - 'left': Tooltip appears to the left of the button
 */
export const examplePiButtonWithTooltipPlacement: PiButtonProps = {
  id: "save-button",
  label: "Save",
  tooltip: "Save your changes",
  tooltipPlacement: "bottom",
  opts: {
    variant: "default",
    size: "md",
  },
};

/**
 * Example showing rich tooltip content using tooltipCard.
 *
 * The `tooltipCard` prop allows you to render any PiCard as the tooltip content,
 * enabling rich tooltips with complex layouts, icons, multiple lines, or any other
 * card-based content. When `tooltipCard` is set, it takes precedence over `tooltip`.
 *
 * Note: `tooltipCard` can be a string (card name) or a full PiCardRef object with props.
 */
export const examplePiButtonWithTooltipCard: PiButtonProps = {
  id: "help-button",
  label: "Help",
  tooltipCard: "pi/text", // Simple example: reference any registered card by name
  tooltipPlacement: "right",
  opts: {
    variant: "ghost",
    size: "icon",
  },
};

/**
 * Example: Comprehensive icon usage showing all options.
 *
 * Icon Usage Summary:
 * 1. `iconLabel` - Use icon as the main button content (takes precedence)
 * 2. `opts.beforeIcon` - Icon displayed before label/content
 * 3. `opts.afterIcon` - Icon displayed after label/content
 *
 * Precedence: iconLabel > contentCard > label
 * When iconLabel is set, it replaces the main content entirely.
 */
export const examplePiButtonIconUsage: PiButtonProps[] = [
  // Icon as main content
  {
    id: "favorite",
    iconLabel: "heart",
    ariaLabel: "Add to favorites",
    tooltip: "Favorite",
    opts: {variant: "ghost", size: "icon"},
  },
  // Text with icon before
  {
    id: "save",
    label: "Save",
    opts: {variant: "default", beforeIcon: "settings"},
  },
  // Text with icon after
  {
    id: "expand",
    label: "Expand",
    opts: {variant: "outline", afterIcon: "more"},
  },
  // Text with icons before AND after
  {
    id: "bookmark",
    label: "Bookmark",
    opts: {variant: "secondary", beforeIcon: "heart", afterIcon: "more"},
  },
];

// ============================================================================
// Playground definition
// ============================================================================

export default definePlayground<PiButtonProps>({
  cardId: "pi/button",
  title: "Button",

  introduction: `
A versatile, Tailwind-styled button with support for multiple **variants**, **sizes**,
icons, tooltips, and loading states.

Set \`opts.variant\` to control the visual style, and \`opts.size\` to control dimensions.
Use \`iconLabel\` for icon-only buttons, or \`opts.beforeIcon\` / \`opts.afterIcon\` to
place icons alongside text labels.

Tooltips accept either a plain string (\`tooltip\`) or any \`PiCardRef\` (\`tooltipCard\`)
for rich custom tooltip content.
  `.trim(),

  preview: (props) => Button(props),

  defaultProps: {
    id: "preview",
    label: "Click me",
    opts: {
      variant: "default",
      size: "default",
    },
  },

  facets: [
    {
      id: "default",
      title: "Default",
      description: "Primary filled button — the main call-to-action.",
      props: {id: "default", label: "Save", opts: {variant: "default"}},
    },
    {
      id: "secondary",
      title: "Secondary",
      description: "Secondary action — less emphasis than the primary.",
      props: {id: "secondary", label: "Cancel", opts: {variant: "secondary"}},
    },
    {
      id: "destructive",
      title: "Destructive",
      description:
        "Red / error colour. Use for irreversible or dangerous actions.",
      props: {
        id: "destructive",
        label: "Delete",
        opts: {variant: "destructive"},
      },
    },
    {
      id: "outline",
      title: "Outline",
      description:
        "Bordered, transparent fill — a softer alternative to default.",
      props: {id: "outline", label: "Edit", opts: {variant: "outline"}},
    },
    {
      id: "ghost",
      title: "Ghost",
      description: "No background — ideal for toolbars, sidebars, and menus.",
      props: {id: "ghost", label: "More", opts: {variant: "ghost"}},
    },
    {
      id: "icon",
      title: "Icon button",
      description:
        "Square button sized for a single icon. Pair with `ariaLabel`.",
      props: {
        id: "icon",
        iconLabel: "settings",
        ariaLabel: "Settings",
        tooltip: "Settings",
        opts: {variant: "ghost", size: "icon"},
      },
    },
    {
      id: "with-tooltip",
      title: "With tooltip",
      description: "Hover text shown via the `tooltip` prop.",
      props: {
        id: "with-tooltip",
        label: "Save",
        tooltip: "Save your changes",
        tooltipPlacement: "bottom",
        opts: {variant: "default"},
      },
    },
    {
      id: "loading",
      title: "Loading",
      description:
        "Shows a spinner and prevents interaction while an async operation is in progress.",
      props: {
        id: "loading",
        label: "Saving…",
        loading: true,
        opts: {variant: "default"},
      },
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Prevents all interaction.",
      props: {
        id: "disabled",
        label: "Unavailable",
        disabled: true,
        opts: {variant: "default"},
      },
    },
  ],

  controls: [
    {prop: "label", type: "text", label: "Label", placeholder: "Button text…"},
    {
      prop: "opts.variant",
      type: "token",
      label: "Variant",
      options: ["default", "secondary", "destructive", "outline", "ghost"],
    },
    {
      prop: "opts.size",
      type: "token",
      label: "Size",
      options: ["default", "xs", "md", "lg", "icon"],
    },
    {prop: "disabled", type: "boolean", label: "Disabled"},
    {prop: "loading", type: "boolean", label: "Loading"},
    {
      prop: "tooltip",
      type: "text",
      label: "Tooltip",
      placeholder: "Hover text…",
    },
    {
      prop: "className",
      type: "text",
      label: "Extra classes",
      placeholder: "e.g. rounded-full",
    },
  ],

  registerEvents: (r, logEvent) => {
    // Fires whenever the button is clicked in the live preview.
    onButtonClicked(r, (state, ev) => {
      logEvent(state, "onButtonClicked", {id: ev.id});
    });
  },

  note: `
Inside \`app.pihanga.ts\`, wire a button to dispatch an action:

\`\`\`ts
import {registerCard, register} from "@pihanga2/core";
import {Button, onButtonClicked} from "@/cards/button";

register((r) => {
  onButtonClicked(r, (state, {id}) => {
    if (id === "save") {
      state.isSaving = true;
    }
  });
});

registerCard("myApp/saveButton", Button({
  id:    "save",
  label: "Save",
  opts:  {variant: "default"},
}));
\`\`\`
  `.trim(),
});
