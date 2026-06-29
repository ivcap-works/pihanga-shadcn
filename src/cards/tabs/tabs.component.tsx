import React, {useState} from "react";
import {Card, type PiCardProps} from "@pihanga2/core";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    maxTabs,
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

  // When maxTabs is set and the number of tabs exceeds it, replace the tab
  // strip with a Select drop-down for navigation.
  const useDropdown = maxTabs !== undefined && tabs.length > maxTabs;

  if (useDropdown) {
    const activeTab = tabs.find((t) => t.id === activeValue);

    return (
      <div data-pihanga={cardName} className={className}>
        {/* Drop-down tab selector */}
        <Select value={activeValue} onValueChange={handleValueChange}>
          <SelectTrigger className={listClassName}>
            <SelectValue placeholder="Select a tab…" />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab.id} value={tab.id} disabled={tab.disabled}>
                {typeof tab.title === "string" ? tab.title : tab.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Content area — render the active tab's card directly */}
        {activeTab && (
          <div className={contentClassName}>
            <Card cardName={activeTab.contentCard} parentCard={cardName} />
          </div>
        )}
      </div>
    );
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
            <TabsTrigger key={tab.id} value={tab.id} disabled={tab.disabled}>
              {typeof tab.title !== "string" ? (
                <Card cardName={tab.title} parentCard={cardName} />
              ) : (
                tab.title
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className={contentClassName}>
            <Card cardName={tab.contentCard} parentCard={cardName} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
