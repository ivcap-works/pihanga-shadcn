import {describe, expect, it, vi} from "vitest";
import {act, fireEvent, render, screen} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

// IMPORTANT: DropDownMenu uses `@pihanga2/core`'s <Card />, which requires a
// redux provider. For these unit tests we just stub it as a regular button.
vi.mock("@pihanga2/core", async () => {
  const React = await import("react");
  return {
    Card: ({cardName}: {cardName: string}) =>
      React.createElement("button", null, cardName),
  };
});

import {Component as DropDownMenuComponent} from "@/cards/dropDownMenu/drop-down.component";
import type {
  DropDownMenuEvents,
  DropDownMenuProps,
} from "@/cards/dropDownMenu/drop-down.types";

// Minimal PiCardProps shape for this component.
// We don't need real Card rendering here; we only assert open/close behavior.
function renderMenu(checkboxCloseDelayMs?: number) {
  const onSelected = vi.fn();

  // @ts-expect-error - we only provide the minimal prop shape needed for these tests
  const props: PiCardProps<DropDownMenuProps, DropDownMenuEvents> = {
    cardName: "test/menu",
    trigger: "test/trigger",
    items: [
      {
        type: "checkbox",
        id: "cb1",
        label: "Merge parts on blur",
        checked: true,
      },
    ],
    checkboxCloseDelayMs,
    onSelected,
  };

  const renderResult = render(<DropDownMenuComponent {...props} />);

  return {onSelected, ...renderResult};
}

function openMenu(container: HTMLElement) {
  const trigger = container.querySelector(
    "[data-pihanga-trigger-wrapper]",
  ) as HTMLElement | null;
  if (!trigger) throw new Error("Trigger wrapper not found");

  // Radix opens dropdown menus on pointer down.
  fireEvent.pointerDown(trigger);
  fireEvent.click(trigger);
}

describe("pihanga/dropDownMenu delayed close", () => {
  it("keeps menu open after checkbox selection and closes after delay; delay resets", () => {
    vi.useFakeTimers();

    const {container} = renderMenu(500);

    // open via trigger
    openMenu(container);

    // select once to start the timer
    fireEvent.click(screen.getByText("Merge parts on blur"));

    // advance just short of the close time: should still be open
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // select again to reset delay
    fireEvent.click(screen.getByText("Merge parts on blur"));
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // still open (timer was reset)
    expect(screen.getByText("Merge parts on blur")).toBeInTheDocument();

    // now let timer elapse
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // content should be gone after close
    expect(screen.queryByText("Merge parts on blur")).not.toBeInTheDocument();
  });

  it("updates checkbox tick immediately while menu stays open", () => {
    vi.useFakeTimers();
    const {container} = renderMenu(1000);

    openMenu(container);

    const item = screen.getByRole("menuitemcheckbox", {
      name: "Merge parts on blur",
    });

    expect(item).toHaveAttribute("data-state", "checked");

    fireEvent.click(item);
    expect(item).toHaveAttribute("data-state", "unchecked");

    fireEvent.click(item);
    expect(item).toHaveAttribute("data-state", "checked");
  });

  it("closes immediately on dismiss (e.g. Escape / blur) even if timer is pending", () => {
    vi.useFakeTimers();
    const {container} = renderMenu(1000);

    // open
    openMenu(container);
    fireEvent.click(screen.getByText("Merge parts on blur"));

    act(() => {
      fireEvent.keyDown(document, {key: "Escape"});
    });

    expect(screen.queryByText("Merge parts on blur")).not.toBeInTheDocument();
  });
});
