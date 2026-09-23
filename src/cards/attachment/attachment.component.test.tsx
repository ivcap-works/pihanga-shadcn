import {describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {registerIcon} from "@/cards/icons";
import {FileText, X} from "lucide-react";

import {AttachmentComponent} from "./attachment.component";
import type {AttachmentEvents, AttachmentProps} from "./attachment.types";

try {
  registerIcon("test-file-text", FileText);
  registerIcon("test-x", X);
} catch {
  // already registered by a previous test file in the same run
}

function renderAttachment(
  props: Partial<AttachmentProps> & {cardName?: string} = {},
) {
  const onActionClicked = vi.fn();
  const onTriggered = vi.fn();
  const full = {
    cardName: "test/attachment",
    title: "sales-dashboard.pdf",
    ...props,
    onActionClicked,
    onTriggered,
  } as unknown as PiCardProps<AttachmentProps, AttachmentEvents>;
  return {onActionClicked, onTriggered, ...render(<AttachmentComponent {...full} />)};
}

describe("shad/attachment", () => {
  it("renders the title and description", () => {
    const {getByText} = renderAttachment({
      title: "sales-dashboard.pdf",
      description: "PDF · 2.4 MB",
    });
    expect(getByText("sales-dashboard.pdf")).toBeInTheDocument();
    expect(getByText("PDF · 2.4 MB")).toBeInTheDocument();
  });

  it("defaults to state=done, size=default, orientation=horizontal", () => {
    const {container} = renderAttachment();
    const root = container.querySelector("[data-slot='attachment']") as HTMLElement;
    expect(root.getAttribute("data-state")).toBe("done");
    expect(root.getAttribute("data-size")).toBe("default");
    expect(root.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("renders an icon media slot when icon is set", () => {
    const {container} = renderAttachment({icon: "test-file-text"});
    expect(container.querySelector("[data-slot='attachment-media'][data-variant='icon']")).not.toBeNull();
  });

  it("renders an image media slot when imageSrc is set", () => {
    const {container} = renderAttachment({
      imageSrc: "https://example.com/a.png",
      imageAlt: "preview",
    });
    const media = container.querySelector(
      "[data-slot='attachment-media'][data-variant='image']",
    );
    expect(media).not.toBeNull();
    expect(media?.querySelector("img")?.getAttribute("src")).toBe(
      "https://example.com/a.png",
    );
  });

  it("fires onActionClicked with id and action when an action button is clicked", () => {
    const {getByLabelText, onActionClicked} = renderAttachment({
      id: "att-1",
      actions: [{id: "remove", icon: "test-x", ariaLabel: "Remove file"}],
    });
    fireEvent.click(getByLabelText("Remove file"));
    expect(onActionClicked).toHaveBeenCalledWith({id: "att-1", action: "remove"});
  });

  it("renders a trigger overlay and fires onTriggered when triggerAriaLabel is set", () => {
    const {getByLabelText, onTriggered} = renderAttachment({
      id: "att-1",
      triggerAriaLabel: "Open sales-dashboard.pdf",
    });
    fireEvent.click(getByLabelText("Open sales-dashboard.pdf"));
    expect(onTriggered).toHaveBeenCalledWith({id: "att-1"});
  });

  it("data-pihanga is set", () => {
    const {container} = renderAttachment({cardName: "app/att"});
    expect(container.querySelector("[data-pihanga='app/att']")).not.toBeNull();
  });
});
