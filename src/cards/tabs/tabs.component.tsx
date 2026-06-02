import React, {useState} from "react";
import {Card, isCardRef, type PiCardProps} from "@pihanga2/core";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import type {TabsEvents, TabsProps} from "./tabs.types";

export const TabsComponent = (
  props: PiCardProps<TabsProps, TabsEvents>,
): React.ReactNode => {
  const {
    tabs,
    value: propValue,
    defaultValue,
    selfManaged = false,
    orientation = "horizontal",
    className,
    listClassName,
    contentClassName,
    cardName,
    onTabChanged,
  } = props;

  // Resolve the initial value for self-managed mode:
  // prefer propValue, then defaultValue, then first tab's id.
  const initialValue = propValue ?? defaultValue ?? tabs[0]?.id ?? "";

  // Internal state used only when selfManaged=true.
  const [managedValue, setManagedValue] = useState<string>(initialValue);

  // Effective active tab:
  //   selfManaged → use internal state
  //   controlled  → use the prop (fall back to first tab if not set)
  const activeValue = selfManaged
    ? managedValue
    : (propValue ?? defaultValue ?? tabs[0]?.id ?? "");

  function handleValueChange(tabId: string) {
    if (selfManaged) {
      setManagedValue(tabId);
    }
    // Always dispatch the Pihanga event so reducers can observe the change
    // even in self-managed mode.
    if (typeof onTabChanged === "function") {
      onTabChanged({tabId});
    }
  }

  return (
    <div data-pihanga={cardName}>
      <Tabs
        value={activeValue}
        onValueChange={handleValueChange}
        orientation={orientation}
        className={className}
      >
        <TabsList className={listClassName}>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
            >
              {isCardRef(tab.title) ? (
                <Card cardName={tab.title} parentCard={cardName} />
              ) : (
                (tab.title as string)
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className={contentClassName}
          >
            <Card cardName={tab.contentCard} parentCard={cardName} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
