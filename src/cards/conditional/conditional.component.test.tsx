import {beforeEach, describe, expect, it, vi} from "vitest";
import {render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

// Mock Card
vi.mock("@pihanga2/core", async () => {
  const React = await import("react");
  return {
    Card: ({cardName}: {cardName: string}) =>
      React.createElement("span", {"data-child": cardName}, cardName),
  };
});

// Mock the breakpoint hooks — return whatever the test wants.
const mockUseBreakpoint = vi.fn((_: unknown): boolean => true);
const mockUseContainerBreakpoint = vi.fn(
  (_a: unknown, _b: unknown): boolean => true,
);

vi.mock("@/components/hooks/use-breakpoint", () => ({
  useBreakpoint: (arg: unknown) => mockUseBreakpoint(arg),
  useContainerBreakpoint: (arg: unknown, ref: unknown) =>
    mockUseContainerBreakpoint(arg, ref),
}));

import {ConditionalComponent} from "./conditional.component";
import type {ConditionalProps} from "./conditional.types";

function renderC(props: Partial<ConditionalProps> & {cardName?: string} = {}) {
  const full = {
    cardName: "test/cond",
    content: "app/x",
    ...props,
  } as unknown as PiCardProps<ConditionalProps>;
  return render(<ConditionalComponent {...full} />);
}

describe("shad/conditional", () => {
  beforeEach(() => {
    mockUseBreakpoint.mockReset();
    mockUseContainerBreakpoint.mockReset();
    mockUseBreakpoint.mockReturnValue(true);
    mockUseContainerBreakpoint.mockReturnValue(true);
  });

  it("renders content when show=true (default) and viewport matches", () => {
    const {container} = renderC({});
    expect(container.querySelector("[data-child='app/x']")).not.toBeNull();
  });

  it("renders null when show=false", () => {
    const {container} = renderC({show: false});
    expect(container.firstChild).toBeNull();
  });

  it("renders null when showOn viewport does NOT match", () => {
    mockUseBreakpoint.mockReturnValue(false);
    const {container} = renderC({showOn: "lg"});
    expect(container.firstChild).toBeNull();
  });

  it("combines show AND showOn (both must be true)", () => {
    mockUseBreakpoint.mockReturnValue(true);
    const {container} = renderC({show: false, showOn: "sm"});
    expect(container.firstChild).toBeNull();
  });

  it("container-query mode renders wrapper div, mounts content only when match", () => {
    mockUseContainerBreakpoint.mockReturnValue(false);
    const {container, rerender} = renderC({
      containerQuery: true,
      showOn: "400px",
    });
    // wrapper is always in the DOM
    expect(container.querySelector("div")).not.toBeNull();
    // but no child
    expect(container.querySelector("[data-child]")).toBeNull();

    // Now flip to matching
    mockUseContainerBreakpoint.mockReturnValue(true);
    rerender(
      <ConditionalComponent
        {...({
          cardName: "test/cond",
          content: "app/x",
          containerQuery: true,
          showOn: "400px",
        } as unknown as PiCardProps<ConditionalProps>)}
      />,
    );
    expect(container.querySelector("[data-child='app/x']")).not.toBeNull();
  });
});
