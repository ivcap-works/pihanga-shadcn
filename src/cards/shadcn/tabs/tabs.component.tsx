import React from "react";
import {Card, isCardRef, type PiCardProps} from "@pihanga2/core";
import type {TabsEvents, TabsProps, TabT} from "@pihanga2/cards";
import clsx from "clsx";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/registry/ui/tabs";

export type TabsSD = {
  root?: string;
  list?: string;
  trigger?: string;
  content?: string;
};

export const Component = (
  props: PiCardProps<TabsProps, TabsEvents>
): React.ReactNode => {
  const {
    tabs,
    value,
    defaultValue,
    orientation,
    ariaLabel,

    style,
    className,
    onChange,
    cardName,
    _cls,
  } = props;

  const sd: TabsSD = style?.shad || {};

  function onChangeHandler(tabID: string) {
    onChange({tabID});
  }

  function renderTab(tab: TabT) {
    return (
      <TabsTrigger value={tab.id} className={clsx(sd.trigger)} key={tab.id}>
        {isCardRef(tab.title) ? (
          <Card cardName={tab.title} parentCard={cardName} />
        ) : (
          (tab.title as string)
        )}
      </TabsTrigger>
    );
  }

  function renderPanel(tab: TabT) {
    return (
      <TabsContent value={tab.id} className={clsx(sd.content)} key={tab.id}>
        <Card cardName={tab.content} parentCard={cardName} />
      </TabsContent>
    );
  }

  const tabP = {
    value,
    defaultValue,
    orientation,
  };

  return (
    <Tabs
      aria-label={ariaLabel}
      {...tabP}
      onValueChange={onChangeHandler}
      className={_cls("root", clsx(className, sd.root))}
      data-pihanga={cardName}
    >
      <TabsList className={clsx(className, sd.list)}>
        {tabs.map(renderTab)}
      </TabsList>
      {tabs.map(renderPanel)}
    </Tabs>
  );
};
