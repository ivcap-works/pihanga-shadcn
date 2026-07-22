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
    theme,
    lineNumbers = true,
    height = "auto",
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

  return (
    <div className={_cls("root", className)} data-pihanga={cardName}>
      <CodeMirror
        value={value}
        height={height}
        readOnly={readOnly}
        theme={theme}
        extensions={extensions}
        basicSetup={{lineNumbers}}
        onChange={(val: string) => onChanged?.({value: val})}
      />
    </div>
  );
};
