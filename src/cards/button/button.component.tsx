import React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";

import {Button, LinkButton} from "@/registry/ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/registry/ui/tooltip";
import {getIcon} from "@/cards/icons";
import {useDropdownOpen} from "@/cards/dropDownMenu/dropdown-context";
import {useFormContext} from "@/cards/form/form.context";

import type {PiButtonEvents, PiButtonProps} from "./button.types";

function resolveIconByName(name?: string): React.ReactNode {
  if (!name) return null;
  return getIcon(name);
}

export const ButtonComponent = (
  props: PiCardProps<PiButtonProps, PiButtonEvents>,
): React.ReactNode => {
  const {
    opts,
    ariaLabel,
    label,
    iconLabel,
    contentCard: content,
    href,
    target,
    tooltip,
    tooltipCard,
    tooltipMode,
    tooltipPlacement,
    className,
    id,
    onClicked,
    cardName,
    _cls,
    active,
    focused,
    disabled,
    loading,
    isPending,
    formAction,
  } = props;

  // Check if this button is inside an open dropdown menu
  const isInsideOpenDropdown = useDropdownOpen();

  // Detect if we are inside a pi/form card via React context, so
  // `formAction` can request a form-level action instead of onClicked.
  const form = useFormContext();

  const beforeIcon = resolveIconByName(opts?.beforeIcon);
  const afterIcon = resolveIconByName(opts?.afterIcon);

  // Determine base content: iconLabel takes precedence, then contentCard, then label
  const baseContent = iconLabel ? (
    resolveIconByName(iconLabel)
  ) : content ? (
    <Card cardName={content} parentCard={cardName} />
  ) : (
    label
  );

  // Render icons as children following shadcn/ui pattern
  const children = (
    <>
      {beforeIcon}
      {baseContent}
      {afterIcon}
    </>
  );

  const common = {
    active,
    focused,
    isMenu: opts?.isMenu,
    truncate: opts?.truncate,
    variant: opts?.variant,
    size: opts?.size,

    disabled,
    loading,
    isPending,
    loadingClassName: opts?.loadingClassName,

    className: `${_cls("root")} ${className || ""}`.trim(),
  };

  // When `formAction` is set and this button is inside a pi/form, clicking
  // it requests that form-level action instead of firing this button's own
  // onClicked.
  const useFormAction = Boolean(formAction) && form.isInForm;

  const handleClick = () => {
    if (useFormAction) {
      form.requestAction(formAction!);
    } else {
      onClicked({id});
    }
  };

  // Native <button type> mirrors `formAction` so the button can never
  // accidentally submit a form it isn't supposed to: "submit" is the only
  // value that should trigger the browser's native form submit; everything
  // else (including no formAction at all) is a plain, non-submitting button.
  const htmlType = formAction === "submit" ? "submit" : "button";

  const renderButton = () => {
    if (href) {
      return (
        <LinkButton
          {...common}
          href={href}
          target={target}
          data-pihanga={cardName}
          label={ariaLabel ?? label}
          onClick={handleClick}
        >
          {children}
        </LinkButton>
      );
    }

    return (
      <Button
        {...common}
        type={htmlType}
        data-pihanga={cardName}
        label={ariaLabel ?? label}
        onClick={handleClick}
      >
        {children}
      </Button>
    );
  };

  if (!tooltip && !tooltipCard) return renderButton();

  // Determine tooltip open state based on mode.
  // If the button is inside an open dropdown, force the tooltip closed
  // to avoid UI conflicts (dropdown menu should take precedence).
  const tooltipOpen = isInsideOpenDropdown
    ? false
    : tooltipMode === "open"
      ? true
      : tooltipMode === "closed"
        ? false
        : undefined; // 'auto' or undefined = uncontrolled

  // Render tooltip content: use tooltipCard if provided, otherwise use tooltip string
  const tooltipContent = tooltipCard ? (
    <Card cardName={tooltipCard} parentCard={cardName} />
  ) : (
    <p data-pihanga={`${cardName}-tooltip`}>{tooltip}</p>
  );

  return (
    <Tooltip open={tooltipOpen}>
      <TooltipTrigger asChild>{renderButton()}</TooltipTrigger>
      <TooltipContent side={tooltipPlacement}>{tooltipContent}</TooltipContent>
    </Tooltip>
  );
};
