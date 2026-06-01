import React from "react";
import {Card, isCardRef, type PiCardProps} from "@pihanga2/core";
import type {SelectEvents, SelectOptionT, SelectProps} from "@pihanga2/cards";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";

// return (
//   <Select>
//     <SelectTrigger className="w-[180px]">
//       <SelectValue placeholder="Select a fruit" />
//     </SelectTrigger>
//     <SelectContent>
//       <SelectGroup>
//         <SelectLabel>Fruits</SelectLabel>
//         <SelectItem value="apple">Apple</SelectItem>
//         <SelectItem value="banana">Banana</SelectItem>
//         <SelectItem value="blueberry">Blueberry</SelectItem>
//         <SelectItem value="grapes">Grapes</SelectItem>
//         <SelectItem value="pineapple">Pineapple</SelectItem>
//       </SelectGroup>
//     </SelectContent>
//   </Select>
// )

export type SelectSD = {
  root?: string;
  trigger?: string;
  content?: string;
};

export const Component = (
  props: PiCardProps<SelectProps, SelectEvents>
): React.ReactNode => {
  const {
    name,
    options,
    value,
    defaultValue,
    placeholder,
    required,
    defaultListboxOpen,
    disabled,
    ariaLabel,

    onChange,
    onOpen,
    onClose,

    style,
    cardName,
    _cls,
  } = props;

  const sd: SelectSD = style?.shad || {};

  function onChangeHandler(optionID: string): void {
    onChange({optionID});
  }

  function onOpenCloseHandler(open: boolean) {
    if (open) {
      onOpen({});
    } else {
      onClose({});
    }
  }

  function renderOption(opt: SelectOptionT) {
    const isCardLabel = isCardRef(opt.label);
    const textValue: string | undefined = isCardLabel
      ? undefined
      : (opt.label as string);
    const p = {
      value: opt.id,
      textValue,
      disabled: opt.disabled,
    };
    return (
      <SelectItem {...p} key={opt.id}>
        {isCardLabel ? (
          <Card cardName={opt.label} parentCard={cardName} />
        ) : (
          (opt.label as string)
        )}
      </SelectItem>
    );
  }

  const p = {
    name,
    value,
    defaultValue,
    defaultOpen: defaultListboxOpen,
    placeholder,
    required,
    disabled,
    className: _cls("root", sd.root),
  };

  return (
    <Select
      aria-label={ariaLabel}
      {...p}
      onValueChange={onChangeHandler}
      onOpenChange={onOpenCloseHandler}
      data-pihanga={cardName}
    >
      <SelectTrigger className={clsx(sd.trigger)}>
        <SelectValue placeholder={placeholder || "... Select"} />
      </SelectTrigger>
      <SelectContent className={clsx(sd.content)}>
        <SelectGroup>{options.map(renderOption)}</SelectGroup>
      </SelectContent>
    </Select>
  );
};
