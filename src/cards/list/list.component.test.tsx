import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

vi.mock("@pihanga2/core", async () => {
  const React = await import("react");
  return {
    Card: ({cardName}: {cardName: string}) =>
      React.createElement("span", {"data-child": cardName}, cardName),
  };
});

import {ListComponent} from "./list.component";
import type {ListEvents, ListItem, ListProps} from "./list.types";

function renderList(
  props: Partial<ListProps> & {cardName?: string} = {},
  onItemClicked = vi.fn(),
) {
  const full = {
    cardName: "test/list",
    items: [],
    ...props,
    onItemClicked,
  } as unknown as PiCardProps<ListProps, ListEvents>;
  return {onItemClicked, ...render(<ListComponent {...full} />)};
}

describe("shad/list", () => {
  const items: ListItem[] = [
    {id: "a", title: "Alpha"},
    {id: "b", title: "Beta", subTitle: "second"},
  ];

  it("renders one <li> per item", () => {
    const {container} = renderList({items});
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });

  it("shows title + subtitle", () => {
    const {getByText} = renderList({items});
    expect(getByText("Alpha")).toBeInTheDocument();
    expect(getByText("Beta")).toBeInTheDocument();
    expect(getByText("second")).toBeInTheDocument();
  });

  it("clicking an item emits onItemClicked with the item id", () => {
    const {getByText, onItemClicked} = renderList({items});
    fireEvent.click(getByText("Alpha"));
    expect(onItemClicked).toHaveBeenCalledWith(
      expect.objectContaining({itemID: "a"}),
    );
  });

  it("marker → list-inside class, else list-none", () => {
    const {container, rerender} = renderList({items, marker: "disc"});
    let ul = container.querySelector("ul") as HTMLUListElement;
    expect(ul.className).toContain("list-inside");
    expect(ul.style.listStyleType).toBe("disc");

    rerender(
      <ListComponent
        {...({
          cardName: "test/list",
          items,
          onItemClicked: vi.fn(),
        } as unknown as PiCardProps<ListProps, ListEvents>)}
      />,
    );
    ul = container.querySelector("ul") as HTMLUListElement;
    expect(ul.className).toContain("list-none");
  });

  it("data-pihanga on the <ul>", () => {
    const {container} = renderList({cardName: "app/list", items});
    expect(container.querySelector("[data-pihanga='app/list']")).not.toBeNull();
  });
});
