import React from "react";
import {Card, type PiCardProps} from "@pihanga2/core";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu.ui";

import type {
  DropDownMenuEntry,
  DropDownMenuEvents,
  DropDownMenuProps,
  MenuContent,
  MenuLabelEntry,
  MenuSubMenuEntry,
} from "./drop-down.types";

import {DropdownOpenContext} from "./dropdown-context";

export const Component = (
  props: PiCardProps<DropDownMenuProps, DropDownMenuEvents>,
): React.ReactNode => {
  const {trigger, menuLabel, menuAlign, items, cardName, checkboxCloseDelayMs} =
    props;

  const [open, setOpen] = React.useState(false);
  const closeTimerRef = React.useRef<number | null>(null);

  const [localCheckboxChecked, setLocalCheckboxChecked] = React.useState<
    Record<string, boolean>
  >({});

  const checkboxKey = React.useCallback((path: string[], id: string) => {
    return [...path, id].join("::");
  }, []);

  const buildCheckboxStateFromItems = React.useCallback(
    (
      entries: DropDownMenuEntry[] | undefined,
      path: string[] = [],
    ): Record<string, boolean> => {
      const state: Record<string, boolean> = {};
      if (!entries?.length) return state;

      for (const entry of entries) {
        if (!entry || typeof entry === "string") continue;
        if (entry.type === "group") {
          Object.assign(state, buildCheckboxStateFromItems(entry.items, path));
          continue;
        }
        if (entry.type === "submenu") {
          const subId = entryIdForPath(entry);
          Object.assign(
            state,
            buildCheckboxStateFromItems(entry.items, [...path, subId]),
          );
          continue;
        }
        if (entry.type === "checkbox") {
          const initial = Boolean(
            entry.checked ?? entry.defaultChecked ?? false,
          );
          state[checkboxKey(path, entry.id)] = initial;
        }
      }

      return state;
    },
    [checkboxKey],
  );

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function closeNow() {
    clearCloseTimer();
    setOpen(false);
  }

  function scheduleClose(delayMs: number) {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setOpen(false);
    }, delayMs);
  }

  React.useEffect(() => {
    return () => {
      // cleanup on unmount
      clearCloseTimer();
    };
  }, []);

  // If the menu model changes while open, resync the local checkbox state.
  // This lets external state updates still win.
  React.useEffect(() => {
    if (!open) return;
    setLocalCheckboxChecked(buildCheckboxStateFromItems(items));
  }, [open, items, buildCheckboxStateFromItems]);

  function renderTrigger() {
    // IMPORTANT: Radix `DropdownMenuTrigger` with `asChild` requires its direct
    // child to accept/forward the props Radix injects (pointer handlers, aria
    // attributes, refs). `@pihanga2/core`'s <Card /> does not forward arbitrary
    // props to the underlying DOM element rendered by the referenced card.
    //
    // So we always provide a real DOM element as the trigger and render the
    // PiCard inside it. Events bubble, so clicking the inner PiButton still
    // toggles the menu.
    //
    // We provide the dropdown's open state via context so nested components
    // (like Button) can hide their tooltips when the dropdown is open.
    return (
      <span className="inline-flex" data-pihanga-trigger-wrapper>
        <DropdownOpenContext.Provider value={open}>
          <Card cardName={trigger} parentCard={cardName} />
        </DropdownOpenContext.Provider>
      </span>
    );
  }

  function renderLabel() {
    if (!menuLabel) return null;
    return (
      <>
        <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
        <DropdownMenuSeparator />
      </>
    );
  }

  function contentToNode(content: MenuContent): React.ReactNode {
    if (typeof content === "string") return content;
    return <Card cardName={content} parentCard={cardName} />;
  }

  function entryIdForPath(entry: MenuSubMenuEntry): string {
    if (entry.id) return entry.id;
    return typeof entry.label === "string" ? entry.label : "submenu";
  }

  function emitSelected(ev: {
    type: "item" | "checkbox" | "radio";
    id: string;
    value?: string;
    checked?: boolean;
    path?: string[];
  }) {
    props.onSelected(ev);
  }

  function renderShortcut(shortcut?: string) {
    if (!shortcut) return null;
    return <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>;
  }

  function renderEntries(entries: DropDownMenuEntry[], path: string[] = []) {
    return entries.map((entry, idx) => {
      if (entry === null) {
        return <DropdownMenuSeparator key={`sep-${idx}`} />;
      }

      if (typeof entry === "string") {
        // legacy style within `items` (still supported)
        return (
          <DropdownMenuItem
            key={`s-${idx}`}
            onSelect={() => emitSelected({type: "item", id: entry, path})}
          >
            {entry}
          </DropdownMenuItem>
        );
      }

      if (entry.type === "separator") {
        return <DropdownMenuSeparator key={`sepobj-${idx}`} />;
      }

      if (entry.type === "label") {
        const e: MenuLabelEntry = entry;
        return (
          <DropdownMenuLabel key={`label-${idx}`} inset={e.inset}>
            {contentToNode(e.label)}
          </DropdownMenuLabel>
        );
      }

      if (entry.type === "group") {
        const e = entry;
        return (
          <DropdownMenuGroup key={`group-${idx}`}>
            {e.label && (
              <DropdownMenuLabel inset={e.inset}>
                {contentToNode(e.label)}
              </DropdownMenuLabel>
            )}
            {renderEntries(e.items, path)}
          </DropdownMenuGroup>
        );
      }

      if (entry.type === "submenu") {
        const e: MenuSubMenuEntry = entry;
        const subId = entryIdForPath(e);
        const nextPath = [...path, subId];
        return (
          <DropdownMenuSub key={`sub-${idx}`}>
            <DropdownMenuSubTrigger inset={e.inset} disabled={e.disabled}>
              {contentToNode(e.label)}
              {renderShortcut(e.shortcut)}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {renderEntries(e.items, nextPath)}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        );
      }

      if (entry.type === "checkbox") {
        const e = entry;
        const key = checkboxKey(path, e.id);
        const checked =
          localCheckboxChecked[key] ??
          Boolean(e.checked ?? e.defaultChecked ?? false);
        return (
          <DropdownMenuCheckboxItem
            key={`cb-${e.id}`}
            checked={checked}
            disabled={e.disabled}
            onCheckedChange={(checked) => {
              const nextChecked = Boolean(checked);

              // Update local state immediately so the tick updates while menu is open.
              setLocalCheckboxChecked((prev) => ({
                ...prev,
                [key]: nextChecked,
              }));

              emitSelected({
                type: "checkbox",
                id: e.id,
                checked: nextChecked,
                path,
              });

              // If a delay is configured, keep menu open but schedule an auto-close.
              // Each checkbox selection resets the timer.
              if (typeof checkboxCloseDelayMs === "number") {
                if (checkboxCloseDelayMs > 0) {
                  scheduleClose(checkboxCloseDelayMs);
                } else {
                  // Treat 0ms as "close immediately".
                  closeNow();
                }
              }
            }}
            onSelect={(evt) => {
              // keepOpen OR delayed-close mode should keep menu open after select.
              if (e.keepOpen || typeof checkboxCloseDelayMs === "number") {
                evt.preventDefault();
              }
            }}
          >
            {contentToNode(e.label)}
            {renderShortcut(e.shortcut)}
          </DropdownMenuCheckboxItem>
        );
      }

      if (entry.type === "radio-group") {
        const e = entry;
        return (
          <DropdownMenuRadioGroup
            key={`rg-${e.id}`}
            value={e.value}
            defaultValue={e.defaultValue}
            onValueChange={(value) => {
              emitSelected({type: "radio", id: e.id, value, path});
            }}
          >
            {e.label && (
              <DropdownMenuLabel inset={e.inset}>
                {contentToNode(e.label)}
              </DropdownMenuLabel>
            )}
            {e.items.map((ri) => (
              <DropdownMenuRadioItem
                key={`${e.id}:${ri.value}`}
                value={ri.value}
                disabled={ri.disabled}
                className={ri.inset ? "pl-8" : undefined}
                hideIcon={ri.hideIcon}
                onSelect={(evt) => {
                  if (ri.keepOpen) evt.preventDefault();
                }}
              >
                {contentToNode(ri.label)}
                {renderShortcut(ri.shortcut)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        );
      }

      if (entry.type === "item") {
        const e = entry;
        return (
          <DropdownMenuItem
            key={`it-${e.id}`}
            disabled={e.disabled}
            className={e.inset ? "pl-8" : undefined}
            onSelect={(evt) => {
              if (e.keepOpen) evt.preventDefault();
              emitSelected({type: "item", id: e.id, path});
            }}
          >
            {contentToNode(e.label)}
            {renderShortcut(e.shortcut)}
          </DropdownMenuItem>
        );
      }

      // Exhaustiveness guard (should never happen)
      return null;
    });
  }

  const effectiveItems = items;

  return (
    <DropdownMenu
      data-pihanga={cardName}
      open={open}
      onOpenChange={(nextOpen) => {
        // Any non-checkbox close reason (outside click, escape, blur, etc.)
        // should close immediately and cancel pending timers.
        if (!nextOpen) {
          closeNow();
          return;
        }

        clearCloseTimer();
        setLocalCheckboxChecked(buildCheckboxStateFromItems(items));
        setOpen(true);
      }}
    >
      <DropdownMenuTrigger asChild>{renderTrigger()}</DropdownMenuTrigger>
      <DropdownMenuContent align={menuAlign}>
        {renderLabel()}
        {effectiveItems?.length ? renderEntries(effectiveItems) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
