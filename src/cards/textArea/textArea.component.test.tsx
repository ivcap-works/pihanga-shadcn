import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import type {PiCardProps} from "@pihanga2/core";

import {TextAreaComponent} from "./textArea.component";
import type {PiTextAreaEvents, PiTextAreaProps} from "./textArea.types";
import {FormContext} from "@/cards/form/form.context";

function makeProps(
  props: Partial<PiTextAreaProps> = {},
  onChanged: ReturnType<typeof vi.fn> = vi.fn(),
  onSubmitted: ReturnType<typeof vi.fn> = vi.fn(),
) {
  const full = {
    cardName: "test/ta",
    ...props,
    onChanged,
    onSubmitted,
  } as unknown as PiCardProps<PiTextAreaProps, PiTextAreaEvents>;
  return {full, onChanged, onSubmitted};
}

describe("shad/text-area (standalone)", () => {
  it("renders `value` from prop", () => {
    const {full} = makeProps({value: "hello"});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.value).toBe("hello");
  });

  it("dispatches onChanged({name,value}) on input", () => {
    const {full, onChanged} = makeProps({name: "bio", value: ""});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    fireEvent.change(el, {target: {value: "hi there"}});
    expect(onChanged).toHaveBeenCalledWith({name: "bio", value: "hi there"});
  });

  it("uses provided `placeholder`", () => {
    const {full} = makeProps({placeholder: "Tell us…"});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.placeholder).toBe("Tell us…");
  });

  it("respects `disabled` and `readOnly`", () => {
    const {full} = makeProps({disabled: true, readOnly: true});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.disabled).toBe(true);
    expect(el.readOnly).toBe(true);
  });

  // -- Sizing modes ---------------------------------------------------

  it("case A1: fixed sizing honours `rows` (default 4)", () => {
    const {full} = makeProps({});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.rows).toBe(4);
    expect(el.className).toContain("field-sizing-fixed");
    expect(el.className).not.toContain("field-sizing-content");
  });

  it("case A2: content sizing sets field-sizing-content class and resize-none by default", () => {
    const {full} = makeProps({fieldSizing: "content", width: "100%"});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.className).toContain("field-sizing-content");
    expect(el.className).toContain("resize-none");
    expect(el.style.width).toBe("100%");
  });

  it("case A4: bounded growth sets min-height/max-height", () => {
    const {full} = makeProps({
      fieldSizing: "content",
      minHeight: "2lh",
      maxHeight: "8lh",
    });
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.style.minHeight).toBe("2lh");
    expect(el.style.maxHeight).toBe("8lh");
  });

  it("case A5: fixed-height scroll pane sets height with fixed field-sizing", () => {
    const {full} = makeProps({height: 200});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.style.height).toBe("200px");
    expect(el.className).toContain("field-sizing-fixed");
  });

  it("case B1: rows/cols are only rendered in fixed mode", () => {
    const {full} = makeProps({fieldSizing: "content", rows: 10, cols: 40});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    // Our component explicitly passes undefined for rows/cols in content
    // mode so no attribute is rendered.
    expect(el.getAttribute("rows")).toBeNull();
    expect(el.getAttribute("cols")).toBeNull();
  });

  it("case B3: explicit width+height with content freezes both axes", () => {
    const {full} = makeProps({fieldSizing: "content", width: 58, height: 100});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.style.width).toBe("58px");
    expect(el.style.height).toBe("100px");
  });

  it("case B4: maxWidth guard is applied", () => {
    const {full} = makeProps({fieldSizing: "content", maxWidth: 600});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.style.maxWidth).toBe("600px");
  });

  // -- Interaction / resize --------------------------------------------

  it("case D1: explicit resize prop overrides the fieldSizing default", () => {
    const {full} = makeProps({fieldSizing: "content", resize: "vertical"});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.className).toContain("resize-y");
    expect(el.className).not.toContain("resize-none");
  });

  it("case D3: writingMode is applied", () => {
    const {full} = makeProps({
      writingMode: "vertical-rl",
      height: 300,
    });
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.style.writingMode).toBe("vertical-rl");
  });

  it("case D4: dir=rtl is forwarded", () => {
    const {full} = makeProps({dir: "rtl"});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.dir).toBe("rtl");
  });

  // -- submitOnEnter ------------------------------------------------------

  it("fires onSubmitted on Enter when submitOnEnter is set", () => {
    const {full, onSubmitted, onChanged} = makeProps({
      name: "chat",
      value: "hello",
      submitOnEnter: true,
    });
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    fireEvent.keyDown(el, {key: "Enter"});
    expect(onSubmitted).toHaveBeenCalledWith({name: "chat", value: "hello"});
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("does NOT fire onSubmitted on Shift+Enter (inserts newline instead)", () => {
    const {full, onSubmitted} = makeProps({submitOnEnter: true});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    fireEvent.keyDown(el, {key: "Enter", shiftKey: true});
    expect(onSubmitted).not.toHaveBeenCalled();
  });

  it("does NOT fire onSubmitted when submitOnEnter is not set", () => {
    const {full, onSubmitted} = makeProps({submitOnEnter: false});
    const {container} = render(<TextAreaComponent {...full} />);
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    fireEvent.keyDown(el, {key: "Enter"});
    expect(onSubmitted).not.toHaveBeenCalled();
  });

  // -- selfManaged (standalone only) --------------------------------------

  describe("selfManaged mode (standalone)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("updates the visible value on every keystroke without dispatching onChanged", () => {
      const {full, onChanged} = makeProps({
        name: "bio",
        value: "",
        selfManaged: true,
      });
      const {container} = render(<TextAreaComponent {...full} />);
      const el = container.querySelector("textarea") as HTMLTextAreaElement;
      fireEvent.change(el, {target: {value: "h"}});
      fireEvent.change(el, {target: {value: "he"}});
      fireEvent.change(el, {target: {value: "hel"}});
      expect(el.value).toBe("hel");
      expect(onChanged).not.toHaveBeenCalled();
    });

    it("commits (fires onChanged once) on blur with no debounceMs set", () => {
      const {full, onChanged} = makeProps({
        name: "bio",
        value: "",
        selfManaged: true,
      });
      const {container} = render(<TextAreaComponent {...full} />);
      const el = container.querySelector("textarea") as HTMLTextAreaElement;
      fireEvent.change(el, {target: {value: "h"}});
      fireEvent.change(el, {target: {value: "he"}});
      fireEvent.change(el, {target: {value: "hello"}});
      expect(onChanged).not.toHaveBeenCalled();
      fireEvent.blur(el);
      expect(onChanged).toHaveBeenCalledTimes(1);
      expect(onChanged).toHaveBeenCalledWith({name: "bio", value: "hello"});
    });

    it("commits after debounceMs of typing inactivity even without blur", () => {
      const {full, onChanged} = makeProps({
        name: "bio",
        value: "",
        selfManaged: true,
        debounceMs: 300,
      });
      const {container} = render(<TextAreaComponent {...full} />);
      const el = container.querySelector("textarea") as HTMLTextAreaElement;
      fireEvent.change(el, {target: {value: "h"}});
      vi.advanceTimersByTime(100);
      fireEvent.change(el, {target: {value: "he"}});
      vi.advanceTimersByTime(100);
      fireEvent.change(el, {target: {value: "hello"}});
      expect(onChanged).not.toHaveBeenCalled();
      vi.advanceTimersByTime(300);
      expect(onChanged).toHaveBeenCalledTimes(1);
      expect(onChanged).toHaveBeenCalledWith({name: "bio", value: "hello"});
    });

    it("blur after a debounce firing re-commits idempotently without throwing", () => {
      const {full, onChanged} = makeProps({
        name: "bio",
        value: "",
        selfManaged: true,
        debounceMs: 300,
      });
      const {container} = render(<TextAreaComponent {...full} />);
      const el = container.querySelector("textarea") as HTMLTextAreaElement;
      fireEvent.change(el, {target: {value: "hello"}});
      vi.advanceTimersByTime(300);
      expect(onChanged).toHaveBeenCalledTimes(1);
      fireEvent.blur(el);
      expect(onChanged).toHaveBeenLastCalledWith({
        name: "bio",
        value: "hello",
      });
    });

    it("commits immediately on Enter with submitOnEnter, cancelling any pending debounce", () => {
      const {full, onChanged, onSubmitted} = makeProps({
        name: "chat",
        value: "",
        selfManaged: true,
        debounceMs: 5000,
        submitOnEnter: true,
      });
      const {container} = render(<TextAreaComponent {...full} />);
      const el = container.querySelector("textarea") as HTMLTextAreaElement;
      fireEvent.change(el, {target: {value: "hi there"}});
      expect(onChanged).not.toHaveBeenCalled();
      fireEvent.keyDown(el, {key: "Enter"});
      expect(onChanged).toHaveBeenCalledWith({name: "chat", value: "hi there"});
      expect(onSubmitted).toHaveBeenCalledWith({
        name: "chat",
        value: "hi there",
      });
      // Advancing past the (now-cancelled) debounce window must not re-fire.
      vi.advanceTimersByTime(6000);
      expect(onChanged).toHaveBeenCalledTimes(1);
    });

    it("dispatches onChanged on every keystroke when selfManaged is false (default)", () => {
      const {full, onChanged} = makeProps({name: "bio", value: ""});
      const {container} = render(<TextAreaComponent {...full} />);
      const el = container.querySelector("textarea") as HTMLTextAreaElement;
      fireEvent.change(el, {target: {value: "h"}});
      fireEvent.change(el, {target: {value: "he"}});
      expect(onChanged).toHaveBeenCalledTimes(2);
    });
  });
});

describe("shad/text-area (inside pi/form)", () => {
  it("reads value from formData when name is set", () => {
    const {full} = makeProps({name: "bio"});
    const {container} = render(
      <FormContext.Provider
        value={{
          isInForm: true,
          formData: {bio: "existing text"},
          errors: {},
          handleChange: vi.fn(),
          setError: () => {},
        }}
      >
        <TextAreaComponent {...full} />
      </FormContext.Provider>,
    );
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(el.value).toBe("existing text");
  });

  it("calls form.handleChange instead of onChanged", () => {
    const handleChange = vi.fn();
    const {full, onChanged} = makeProps({name: "bio"});
    const {container} = render(
      <FormContext.Provider
        value={{
          isInForm: true,
          formData: {bio: ""},
          errors: {},
          handleChange,
          setError: () => {},
        }}
      >
        <TextAreaComponent {...full} />
      </FormContext.Provider>,
    );
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    fireEvent.change(el, {target: {value: "new bio"}});
    expect(handleChange).toHaveBeenCalledWith("bio", "new bio");
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("ignores `selfManaged`/`debounceMs` inside a form — every keystroke commits via form.handleChange, matching pi/input", () => {
    const handleChange = vi.fn();
    const {full} = makeProps({
      name: "bio",
      selfManaged: true,
      debounceMs: 5000,
    });
    const {container} = render(
      <FormContext.Provider
        value={{
          isInForm: true,
          formData: {bio: ""},
          errors: {},
          handleChange,
          setError: () => {},
        }}
      >
        <TextAreaComponent {...full} />
      </FormContext.Provider>,
    );
    const el = container.querySelector("textarea") as HTMLTextAreaElement;
    fireEvent.change(el, {target: {value: "n"}});
    fireEvent.change(el, {target: {value: "new bio"}});
    // Committed immediately on every keystroke — no blur/debounce needed,
    // just like pi/input's form-bound behaviour.
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenLastCalledWith("bio", "new bio");
  });
});
