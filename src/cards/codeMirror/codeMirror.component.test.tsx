import {beforeEach, describe, expect, it, vi} from "vitest";
import {render} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";
import type {Extension} from "@codemirror/state";

// Capture the props the card forwards to the CodeMirror editor.
const editorProps = vi.hoisted(() => ({current: {} as Record<string, unknown>}));

vi.mock("@uiw/react-codemirror", async () => {
  const React = await import("react");
  return {
    default: (props: Record<string, unknown>) => {
      editorProps.current = props;
      return React.createElement("div", {"data-testid": "editor"});
    },
  };
});

import {CodeMirrorComponent} from "./codeMirror.component";
import {
  registerExtensions,
  type CodeMirrorCardProps,
  type CodeMirrorCardEvents,
} from "./codeMirror.types";

function renderEditor(props: Partial<CodeMirrorCardProps> = {}) {
  const full = {
    cardName: "test/codeMirror",
    _cls: (..._names: unknown[]) => "",
    ...props,
  } as unknown as PiCardProps<CodeMirrorCardProps, CodeMirrorCardEvents>;
  return render(<CodeMirrorComponent {...full} />);
}

describe("shad/codeMirror component", () => {
  beforeEach(() => {
    editorProps.current = {};
    vi.restoreAllMocks();
  });

  describe("basicSetup defaults", () => {
    it("keeps the current defaults when no flags are given", () => {
      renderEditor();
      expect(editorProps.current.basicSetup).toEqual({
        lineNumbers: true,
        foldGutter: true,
        dropCursor: true,
        allowMultipleSelections: true,
        indentOnInput: true,
      });
    });

    it("forwards each basicSetup flag from the props", () => {
      renderEditor({
        lineNumbers: false,
        foldGutter: false,
        dropCursor: false,
        allowMultipleSelections: false,
        indentOnInput: false,
      });
      expect(editorProps.current.basicSetup).toEqual({
        lineNumbers: false,
        foldGutter: false,
        dropCursor: false,
        allowMultipleSelections: false,
        indentOnInput: false,
      });
    });
  });

  describe("height props", () => {
    it("passes minHeight and maxHeight through to the editor", () => {
      renderEditor({height: "auto", minHeight: "120px", maxHeight: "600px"});
      expect(editorProps.current.height).toBe("auto");
      expect(editorProps.current.minHeight).toBe("120px");
      expect(editorProps.current.maxHeight).toBe("600px");
    });
  });

  describe("theme", () => {
    it("uses the built-in light theme by default", () => {
      renderEditor();
      expect(editorProps.current.theme).toBe("light");
    });

    it("uses the built-in dark theme", () => {
      renderEditor({theme: "dark"});
      expect(editorProps.current.theme).toBe("dark");
    });

    it("applies a registered theme key as an extension bundle", () => {
      const dracula = [{id: "dracula-marker"}] as unknown as Extension[];
      registerExtensions("dracula", dracula);

      renderEditor({theme: "dracula"});

      expect(editorProps.current.theme).toBe(dracula);
    });

    it("warns and falls back to light for an unknown theme key", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      renderEditor({theme: "does-not-exist"});

      expect(editorProps.current.theme).toBe("light");
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('Unknown theme "does-not-exist"'),
      );
    });
  });
});
