import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

// Stub the theme provider hook so we don't need the real context.
const setThemeMock = vi.fn();
vi.mock("@/components/theme-provider", () => ({
  useTheme: () => ({theme: "light", setTheme: setThemeMock}),
}));

import {ModeToggleComponent} from "./mode-toggle.component";
import type {ModeToggleEvents, ModeToggleProps} from "./mode-toggle.types";

function renderMT(
  props: Partial<ModeToggleProps> & {cardName?: string} = {},
  onModeChanged = vi.fn(),
) {
  const full = {
    cardName: "test/mt",
    ...props,
    onModeChanged,
  } as unknown as PiCardProps<ModeToggleProps, ModeToggleEvents>;
  return {onModeChanged, ...render(<ModeToggleComponent {...full} />)};
}

describe("shad/mode-toggle", () => {
  it("renders a button with a sr-only 'Toggle theme' label", () => {
    const {getByText} = renderMT();
    expect(getByText("Toggle theme")).toBeInTheDocument();
  });

  it("data-pihanga on root button", () => {
    const {container} = renderMT({cardName: "app/mt"});
    expect(container.querySelector("[data-pihanga='app/mt']")).not.toBeNull();
  });

  it("clicking toggles theme (light->dark) and emits onModeChanged", () => {
    setThemeMock.mockClear();
    const {container, onModeChanged} = renderMT();
    const btn = container.querySelector("button") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(setThemeMock).toHaveBeenCalledWith("dark");
    expect(onModeChanged).toHaveBeenCalledWith({mode: "dark"});
  });
});
