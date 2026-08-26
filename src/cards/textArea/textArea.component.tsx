import React, {useEffect, useRef, useState} from "react";
import {type PiCardProps} from "@pihanga2/core";
import {Textarea} from "@/components/ui/textarea";
import {useFormContext} from "@/cards/form/form.context";
import {cn} from "@/lib/utils";
import type {
  CssLength,
  PiTextAreaEvents,
  PiTextAreaProps,
} from "./textArea.types";

function toCssLength(v: CssLength | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

export const TextAreaComponent = (
  props: PiCardProps<PiTextAreaProps, PiTextAreaEvents>,
): React.ReactNode => {
  const {
    name,
    value: propValue = "",
    placeholder,
    disabled,
    readOnly,
    rows = 4,
    cols,
    fieldSizing = "fixed",
    resize,
    minHeight,
    maxHeight,
    width,
    height,
    maxWidth,
    dir,
    writingMode,
    submitOnEnter,
    selfManaged = false,
    debounceMs = 0,
    className,
    style,
    autoFocus,
    cardName,
    onChanged,
    onSubmitted,
  } = props;

  // Focus the textarea once, the first time it is mounted/shown (e.g. when a
  // dialog or drawer opens). Intentionally an empty dependency array — this
  // must not re-fire on subsequent re-renders.
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // `id` may be injected by a parent pi/field card via Pihanga's extra-prop
  // forwarding. Not part of the official type so read through an escape hatch.
  const injectedId = (props as {id?: string}).id;
  const invalid = Boolean((props as {invalid?: boolean}).invalid);

  // Detect if we are inside a pi/form card via React context. When inside a
  // form, the form itself is the source of truth and buffering mechanism
  // (see pi/input, pi/text-field, etc.) — every keystroke writes straight to
  // form.formData via handleChange, and `selfManaged`/`debounceMs` are
  // ignored: there's no separate "commit" step to defer since the form's own
  // submit action is that commit point.
  const form = useFormContext();
  const useFormData = form.isInForm && Boolean(name);

  const canonicalValue = useFormData
    ? ((form.formData[name!] as string | undefined) ?? "")
    : propValue;

  // Self-managed buffering only applies in standalone mode.
  const applySelfManaged = selfManaged && !useFormData;

  // ---------------------------------------------------------------------
  // Self-managed mode (standalone only): keep an internal, always-up-to-date
  // text buffer so typing never lags, but only dispatch the outgoing
  // onChanged event on blur (and, optionally, after a trailing debounce
  // window) — not on every keystroke.
  // ---------------------------------------------------------------------
  const [localValue, setLocalValue] = useState(canonicalValue);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValue = useRef<string>(canonicalValue);

  // Keep the local buffer in sync if the canonical value changes from
  // outside (e.g. a reset) while not actively editing.
  useEffect(() => {
    if (applySelfManaged) setLocalValue(canonicalValue);
  }, [canonicalValue, applySelfManaged]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current != null) clearTimeout(debounceTimer.current);
    };
  }, []);

  const value = applySelfManaged ? localValue : canonicalValue;

  function commitChange(newValue: string) {
    if (useFormData) {
      form.handleChange(name!, newValue);
    } else {
      onChanged({name, value: newValue});
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value;

    if (!applySelfManaged) {
      // Inside a form, or selfManaged not requested: commit on every
      // keystroke, matching pi/input's default (non-onCommitted) behaviour.
      commitChange(newValue);
      return;
    }

    // Self-managed (standalone): update the visible text immediately, defer
    // the outgoing event.
    setLocalValue(newValue);
    pendingValue.current = newValue;

    if (debounceMs > 0) {
      if (debounceTimer.current != null) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        debounceTimer.current = null;
        commitChange(pendingValue.current);
      }, debounceMs);
    }
  }

  function handleBlur() {
    if (!applySelfManaged) return;
    if (debounceTimer.current != null) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    commitChange(pendingValue.current);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (
      submitOnEnter &&
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      e.preventDefault();
      const currentValue = e.currentTarget.value;
      if (applySelfManaged && debounceTimer.current != null) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
        commitChange(currentValue);
      }
      onSubmitted({name, value: currentValue});
    }
  }

  // Default resize behaviour: content-sizing boxes shouldn't be manually
  // resizable (dragging writes an inline width/height that permanently
  // defeats field-sizing: content).
  const resolvedResize =
    resize ?? (fieldSizing === "content" ? "none" : "vertical");

  const resizeClass =
    resolvedResize === "none"
      ? "resize-none"
      : resolvedResize === "vertical"
        ? "resize-y"
        : resolvedResize === "horizontal"
          ? "resize-x"
          : "resize";

  // `field-sizing` is expressed as a Tailwind utility class (shipped by
  // Tailwind v4) rather than an inline style — this is both more idiomatic
  // for this codebase (the base Textarea already defaults to
  // `field-sizing-content`) and avoids relying on very new CSS properties
  // being present in every CSSStyleDeclaration IDL implementation.
  const fieldSizingClass =
    fieldSizing === "content" ? "field-sizing-content" : "field-sizing-fixed";

  const inlineStyle: React.CSSProperties = {
    minHeight: toCssLength(minHeight),
    maxHeight: toCssLength(maxHeight),
    width: toCssLength(width),
    height: toCssLength(height),
    maxWidth: toCssLength(maxWidth),
    writingMode,
    ...style,
  };

  // Use the id injected by pi/field (for label↔control linking); fall back
  // to a locally-generated id when used standalone.
  const selfId = `${cardName}-${name ?? "field"}`;
  const fieldId = injectedId ?? selfId;

  return (
    <Textarea
      ref={textareaRef}
      id={fieldId}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      rows={fieldSizing === "fixed" ? rows : undefined}
      cols={fieldSizing === "fixed" ? cols : undefined}
      dir={dir}
      aria-invalid={invalid || undefined}
      data-pihanga={cardName}
      className={cn(fieldSizingClass, resizeClass, className)}
      style={inlineStyle}
    />
  );
};
