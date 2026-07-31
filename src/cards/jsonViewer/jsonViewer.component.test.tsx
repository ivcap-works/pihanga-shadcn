import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {JsonViewerComponent} from "./jsonViewer.component";
import type {JsonViewerEvents, JsonViewerProps} from "./jsonViewer.types";

function renderJV(
  props: Partial<JsonViewerProps> & {cardName?: string} = {},
  onCopied = vi.fn(),
) {
  const full = {
    cardName: "test/jv",
    source: {a: 1, b: [2, 3]},
    _cls: () => "",
    ...props,
    onCopied,
  } as unknown as PiCardProps<JsonViewerProps, JsonViewerEvents>;
  return {onCopied, ...render(<JsonViewerComponent {...full} />)};
}

describe("shad/json-viewer", () => {
  it("renders JSON content", () => {
    const {container} = renderJV({source: {hello: "world"}});
    // Property key is rendered
    expect(container.textContent).toContain("hello");
    expect(container.textContent).toContain("world");
  });

  it("data-pihanga is set", () => {
    const {container} = renderJV({cardName: "app/jv"});
    expect(container.querySelector("[data-pihanga='app/jv']")).not.toBeNull();
  });

  it("shows copy button when copyToClipboard=true", () => {
    const {container} = renderJV({copyToClipboard: true});
    expect(container.querySelector(".jv-copy-btn")).not.toBeNull();
  });

  it("hides copy button by default", () => {
    const {container} = renderJV({});
    expect(container.querySelector(".jv-copy-btn")).toBeNull();
  });

  it("clicking copy triggers clipboard write + onCopied", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {writeText, write: vi.fn().mockResolvedValue(undefined)},
    });
    // Force fallback path (no ClipboardItem) by deleting global if present
    // (jsdom typically doesn't have it anyway)
    // @ts-expect-error clean up test global
    delete globalThis.ClipboardItem;

    const {container, onCopied} = renderJV({
      source: {x: 1},
      copyToClipboard: true,
    });
    const btn = container.querySelector(".jv-copy-btn") as HTMLButtonElement;
    fireEvent.click(btn);
    // clipboard write is async — wait a microtask
    await Promise.resolve();
    await Promise.resolve();
    expect(writeText).toHaveBeenCalled();
    expect(onCopied).toHaveBeenCalledWith({success: true});
  });
});
