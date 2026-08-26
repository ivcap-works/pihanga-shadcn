import {describe, expect, it, vi} from "vitest";
import {fireEvent, render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

// Mock the nested <Card /> to avoid needing a redux store.
vi.mock("@pihanga2/core", async () => {
  const React = await import("react");
  return {
    Card: ({cardName}: {cardName: string}) =>
      React.createElement("span", {"data-child": cardName}, cardName),
  };
});

import {ObservableComponent} from "./observable.component";
import type {ObservableEvents, ObservableProps} from "./observable.types";

function renderObservable(
  props: Partial<ObservableProps> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events: Partial<Record<keyof ObservableEvents, any>> = {},
) {
  const noop = () => {};
  const full = {
    cardName: "test/observable",
    onClicked: noop,
    onDoubleClicked: noop,
    onMouseDown: noop,
    onMouseUp: noop,
    onMouseEnter: noop,
    onMouseMove: noop,
    onMouseLeave: noop,
    onContextMenu: noop,
    onWheel: noop,
    onKeyDown: noop,
    onKeyUp: noop,
    onFocus: noop,
    onBlur: noop,
    ...events,
    ...props,
  } as unknown as PiCardProps<ObservableProps, ObservableEvents>;
  return render(<ObservableComponent {...full} />);
}

describe("shad/observable component", () => {
  it("renders a div with data-pihanga", () => {
    const {container} = renderObservable();
    const el = container.querySelector("[data-pihanga='test/observable']");
    expect(el?.tagName).toBe("DIV");
  });

  it("renders content card", () => {
    const {container} = renderObservable({content: "myApp/child"});
    const child = container.querySelector("[data-child]");
    expect(child).toHaveAttribute("data-child", "myApp/child");
  });

  it("does NOT fire onClicked when clicked is not enabled", () => {
    const onClicked = vi.fn();
    const {container} = renderObservable({}, {onClicked});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    fireEvent.click(el);
    expect(onClicked).not.toHaveBeenCalled();
  });

  it("fires onClicked when clicked is enabled", () => {
    const onClicked = vi.fn();
    const {container} = renderObservable(
      {enable: {clicked: true}},
      {onClicked},
    );
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    fireEvent.click(el);
    expect(onClicked).toHaveBeenCalledTimes(1);
    const payload = onClicked.mock.calls[0][0];
    expect(payload).toHaveProperty("absoluteX");
    expect(payload).toHaveProperty("absoluteY");
    expect(payload).toHaveProperty("relativeX");
    expect(payload).toHaveProperty("relativeY");
  });

  it("does not attach mouseMove handler when disabled but attaches when enabled", () => {
    const onMouseMove = vi.fn();
    const {container} = renderObservable(
      {enable: {mouseMove: true}},
      {onMouseMove},
    );
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    fireEvent.mouseMove(el);
    expect(onMouseMove).toHaveBeenCalledTimes(1);
  });

  it("sets tabIndex when keyboard events are enabled", () => {
    const {container} = renderObservable({enable: {keyDown: true}});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.tabIndex).toBe(0);
  });

  it("does not set tabIndex when no keyboard events are enabled", () => {
    const {container} = renderObservable({enable: {clicked: true}});
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(el.getAttribute("tabindex")).toBeNull();
  });

  it("fires onKeyDown with key info when enabled", () => {
    const onKeyDown = vi.fn();
    const {container} = renderObservable(
      {enable: {keyDown: true}},
      {onKeyDown},
    );
    const el = container.querySelector("[data-pihanga]") as HTMLElement;
    fireEvent.keyDown(el, {key: "Enter", code: "Enter"});
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onKeyDown.mock.calls[0][0]).toMatchObject({key: "Enter"});
  });
});
