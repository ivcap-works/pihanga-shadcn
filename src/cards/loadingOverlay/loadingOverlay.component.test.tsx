import {describe, expect, it, vi} from "vitest";
import {render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

vi.mock("@pihanga2/core", async () => {
  const React = await import("react");
  return {
    Card: ({cardName}: {cardName: string}) =>
      React.createElement("span", {"data-child": cardName}, cardName),
  };
});

import {LoadingOverlayComponent} from "./loadingOverlay.component";
import type {LoadingOverlayProps} from "./loadingOverlay.types";

function renderLO(
  props: Partial<LoadingOverlayProps> & {cardName?: string} = {},
) {
  const full = {
    cardName: "test/lo",
    ...props,
  } as unknown as PiCardProps<LoadingOverlayProps>;
  return render(<LoadingOverlayComponent {...full} />);
}

describe("shad/loading-overlay", () => {
  it("returns null when no content", () => {
    const {container} = renderLO({isLoading: true});
    expect(container.firstChild).toBeNull();
  });

  it("wraps content and shows overlay when isLoading=true", () => {
    const {container, getByText} = renderLO({
      isLoading: true,
      content: "app/x",
      label: "Please wait",
    });
    const wrap = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(wrap.className).toContain("is-loading");
    expect(container.querySelector("[data-child='app/x']")).not.toBeNull();
    expect(getByText("Please wait")).toBeInTheDocument();
  });

  it("hides the loading state when isLoading=false", () => {
    const {container} = renderLO({content: "app/x", isLoading: false});
    const wrap = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(wrap.className).not.toContain("is-loading");
  });

  it("uses default label 'Loading...'", () => {
    const {getByText} = renderLO({content: "app/x", isLoading: true});
    expect(getByText("Loading...")).toBeInTheDocument();
  });

  it.each([
    ["fillParent", "fill-parent"],
    ["viewportCentered", "viewport-centered"],
  ] as const)("adds %s class when %s is true", (prop, cls) => {
    const {container} = renderLO({
      content: "app/x",
      isLoading: true,
      [prop]: true,
    });
    const wrap = container.querySelector("[data-pihanga]") as HTMLElement;
    expect(wrap.className).toContain(cls);
  });
});
