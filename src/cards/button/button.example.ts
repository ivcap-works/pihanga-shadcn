import {registerIcon} from "@/cards/icons";
import {MoreHorizontalIcon, Settings, Heart} from "lucide-react";

import type {PiButtonProps} from "./button.types";

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
