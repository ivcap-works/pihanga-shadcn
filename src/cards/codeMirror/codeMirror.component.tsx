import React, {useMemo} from "react";
import type {PiCardProps} from "@pihanga2/core";
import CodeMirror from "@uiw/react-codemirror";
import {StreamLanguage} from "@codemirror/language";
import type {Extension} from "@codemirror/state";

import type {
  CodeMirrorCardProps,
  CodeMirrorCardEvents,
} from "./codeMirror.types";
import {resolveStreamParser, resolveExtensions} from "./codeMirror.types";

export const CodeMirrorComponent = (
  props: PiCardProps<CodeMirrorCardProps, CodeMirrorCardEvents>,
): React.ReactNode => {
  const {
    value = "",
    readOnly = false,
    streamLanguage,
    extensionsKey,
    theme = "light",
    lineNumbers = true,
    foldGutter = true,
    dropCursor = true,
    allowMultipleSelections = true,
    indentOnInput = true,
    height = "auto",
    minHeight,
    maxHeight,
    className,
    cardName,
    _cls,
    onChanged,
  } = props;

  /**
   * Build the effective extension list once per unique combination of keys.
   * Complex values (StreamParser, Extension[]) are looked up from the
   * module-level registries — never stored in Redux-serialised card props.
   */
  const extensions = useMemo<Extension[]>(() => {
    const ext: Extension[] = extensionsKey
      ? [...(resolveExtensions(extensionsKey) ?? [])]
      : [];
    if (streamLanguage) {
      const parser = resolveStreamParser(streamLanguage);
      if (parser) ext.push(StreamLanguage.define(parser));
    }
    return ext;
  }, [streamLanguage, extensionsKey]);

  /**
   * "light" / "dark" are built in. Any other value must be a theme bundle
   * registered with registerExtensions(); the bundle is applied as an
   * extension and the built-in light theme is suppressed.
   */
  const themeProp = useMemo<
    "light" | "dark" | "none" | Extension | Extension[]
  >(() => {
    if (theme === "dark") return "dark";
    if (theme === "light") return "light";
    const themeExt = resolveExtensions(theme);
    if (themeExt) return themeExt;
    console.warn(
      `[shad/codeMirror] Unknown theme "${theme}". Register it with registerExtensions() or use "light" / "dark". Falling back to "light".`,
    );
    return "light";
  }, [theme]);

  return (
    <div className={_cls("root", className)} data-pihanga={cardName}>
      <CodeMirror
        value={value}
        height={height}
        minHeight={minHeight}
        maxHeight={maxHeight}
        readOnly={readOnly}
        theme={themeProp}
        extensions={extensions}
        basicSetup={{
          lineNumbers,
          foldGutter,
          dropCursor,
          allowMultipleSelections,
          indentOnInput,
        }}
        onChange={(val: string) => onChanged?.({value: val})}
      />
    </div>
  );
};
