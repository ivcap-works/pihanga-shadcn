import React, {useState} from "react";
import ReactMarkdown from "react-markdown";
import type {Components} from "react-markdown";
import {type PiCardProps} from "@pihanga2/core";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeMermaid from "rehype-mermaid";
import "./katex.css";
import "highlight.js/styles/github.css";
import "./markdownViewer.code.css";

import type {MarkdownViewerProps} from "./markdownViewer.types";

/**
 * Default component overrides applied to every MarkdownViewer instance.
 *
 * Goals:
 *  - Fenced code blocks  → GitHub-like appearance (handled via CSS + rehype-highlight)
 *  - Inline `code` spans → subtle muted-pill style (handled via CSS)
 *
 * The `node` prop injected by react-markdown is destructured and discarded
 * here so it doesn't propagate to native DOM elements and trigger React
 * "unknown prop" warnings.
 */
const DEFAULT_COMPONENTS: Components = {
  // Pass `node` through as `_node` to keep it out of the DOM spread.
  pre: ({node: _node, children, ...rest}) => <pre {...rest}>{children}</pre>,
  code: ({node: _node, children, ...rest}) => <code {...rest}>{children}</code>,
};

export const MarkdownViewerComponent = (
  props: PiCardProps<MarkdownViewerProps>,
): React.ReactNode => {
  const {
    source,
    path,
    maxBodyLength = -1,
    remarkPlugins = [remarkMath, remarkGfm],
    rehypePlugins = [rehypeKatex, rehypeHighlight, rehypeMermaid],
    remarkRehypeOptions,
    components,
    className,
    style = {},
    cardName,
    _cls,
  } = props;

  const [fetchedText, setFetchedText] = useState("");
  const text = source || fetchedText;

  if (path && fetchedText === "") {
    fetch(path)
      .then((response) => response.text())
      .then((fetched) => setFetchedText(fetched));
  }

  function decode(s: string): string {
    try {
      return decodeURI(s);
    } catch {
      // may fail if actually not encoded and contains '%'
      return s;
    }
  }

  function shortenBody(body: string): string {
    if (body.length <= maxBodyLength) return body;

    const shortened = body
      .split(" ")
      .reduce(
        (p, el) => {
          const [a, cnt] = p;
          if (cnt < maxBodyLength) {
            return [a.concat(el), cnt + el.length + 1] as [string[], number];
          } else {
            return p;
          }
        },
        [[], 0] as [string[], number],
      )[0]
      .join(" ");
    return shortened.length < body.length ? `${shortened}...` : body;
  }

  const decoded = decode(text);
  const content = maxBodyLength > 0 ? shortenBody(decoded) : decoded;

  // Merge caller-supplied component overrides on top of our defaults.
  const mergedComponents: Components = {...DEFAULT_COMPONENTS, ...components};

  return (
    <div
      className={_cls("root", className)}
      style={style}
      data-pihanga={cardName}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={
          rehypePlugins as Parameters<typeof ReactMarkdown>[0]["rehypePlugins"]
        }
        remarkRehypeOptions={remarkRehypeOptions}
        components={mergedComponents}
        className={`${_cls("inner")} md-prose`}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
