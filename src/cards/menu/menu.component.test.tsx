import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {MenuComponent} from "./menu.component";
import type {MenuEvents, MenuProps} from "./menu.types";

function renderMenu(
  props: Partial<MenuProps> & {cardName?: string} = {},
  onClicked = vi.fn(),
) {
  const full = {
    cardName: "test/menu",
    menuButton: {label: "File"},
    items: [],
    ...props,
    onClicked,
  } as unknown as PiCardProps<MenuProps, MenuEvents>;
  return {onClicked, ...render(<MenuComponent {...full} />)};
}

describe("shad/menu", () => {
  it("renders the menu trigger label", () => {
    const {getByText} = renderMenu({menuButton: {label: "Edit"}});
    expect(getByText("Edit")).toBeInTheDocument();
  });

  it("data-pihanga is set", () => {
    const {container} = renderMenu({cardName: "app/mm"});
    expect(container.querySelector("[data-pihanga='app/mm']")).not.toBeNull();
  });

  it("disables trigger when menuButton.isDisabled", () => {
    const {container} = renderMenu({
      menuButton: {label: "Off", isDisabled: true},
    });
    const trigger = container.querySelector("button") as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
  });

  it("clicking a menu item calls onClicked({itemID})", () => {
    // Radix Menubar content is only rendered after opening the trigger.
    // We open, then click the item.
    const {container, onClicked, getByText} = renderMenu({
      menuButton: {label: "Actions"},
      items: [{id: "save", title: "Save"}],
    });

    const trigger = container.querySelector("button") as HTMLButtonElement;
    // Radix opens on pointerDown
    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);

    const saveItem = getByText("Save");
    fireEvent.click(saveItem);
    expect(onClicked).toHaveBeenCalledWith({itemID: "save"});
  });
});
