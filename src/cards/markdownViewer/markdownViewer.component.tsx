import React, {useEffect, useRef, useState} from "react";
import ReactMarkdown from "react-markdown";
import type {Components} from "react-markdown";
import {type PiCardProps} from "@pihanga2/core";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import mermaid from "mermaid";
import "./katex.css";
import "highlight.js/styles/github.css";
import "./markdownViewer.code.css";

import type {MarkdownViewerProps} from "./markdownViewer.types";

/**
 * Lazily initialise Mermaid once per page load (not per component mount).
 * Detects the current dark/light theme from the `<html>` element and picks
 * the matching Mermaid theme so edge labels and diagram colours look correct.
 */
let _mermaidReady = false;
function ensureMermaid() {
  if (!_mermaidReady) {
    const isDark = document.documentElement.classList.contains("dark");
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "default",
      themeVariables: {
        // Keep edge label background white so labels don't bleed through arrows
        edgeLabelBackground: "#ffffff",
        // Match the font size we enforce in CSS so node sizes are calculated correctly
        fontSize: "14px",
      },
    });
    _mermaidReady = true;
  }
}

/**
 * Renders a single Mermaid diagram asynchronously.
 * The diagram code is passed via the `code` prop (raw text from the fenced block).
 */
const MermaidDiagram: React.FC<{code: string}> = ({code}) => {
  const [svg, setSvg] = useState<string>("");
  // Each diagram needs a unique id for mermaid.render()
  const id = useRef(`mermaid-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    ensureMermaid();
    let cancelled = false;
    mermaid
      .render(id, code)
      .then(({svg: rendered}) => {
        if (!cancelled) {
          // Append an override <style> inside the SVG so it takes precedence
          // over Mermaid's own injected styles (which come earlier in the SVG).
          // This removes the opaque background box on edge labels.
          // Note: avoid </x> in template literals — TSX parser misreads them.
          const svgClose = "<" + "/svg>";
          const styleClose = "<" + "/style>";
          const overrideStyle =
            "<style>" +
            // Reset font size so page CSS can't make text overflow node boxes
            ".mermaid-diagram svg,foreignObject div,foreignObject span,foreignObject p{" +
            "font-size:14px!important}" +
            // White edge-label background with padding so descenders aren't clipped
            ".edgeLabel,.edgeLabel span,.edgeLabel div,.edgeLabel p{" +
            "background:#ffffff!important;" +
            "background-color:#ffffff!important;" +
            "padding:2px 4px!important;" +
            "line-height:1.4!important}" +
            styleClose;
          setSvg(rendered.replace(svgClose, overrideStyle + svgClose));
        }
      })
      .catch((err) => {
        if (!cancelled) setSvg(`<pre style="color:red">${String(err)}</pre>`);
      });
    return () => {
      cancelled = true;
    };
  }, [id, code]);

  if (!svg) return null;
  // mermaid.render() returns a sanitised SVG string — safe to inject directly.
  return (
    <div className="mermaid-diagram" dangerouslySetInnerHTML={{__html: svg}} />
  );
};

/**
 * Default component overrides applied to every MarkdownViewer instance.
 *
 * Goals:
 *  - Fenced ```mermaid``` blocks → rendered as Mermaid SVG diagrams
 *  - Fenced code blocks          → GitHub-like appearance (CSS + rehype-highlight)
 *  - Inline `code` spans         → subtle muted-pill style (CSS)
 *
 * The `node` prop injected by react-markdown is destructured and discarded
 * here so it doesn't propagate to native DOM elements and trigger React
 * "unknown prop" warnings.
 */
const DEFAULT_COMPONENTS: Components = {
  pre: ({node: _node, children, ...rest}) => <pre {...rest}>{children}</pre>,
  code: ({node: _node, className, children, ...rest}) => {
    const lang = /language-(\w+)/.exec(className ?? "")?.[1];
    if (lang === "mermaid") {
      return <MermaidDiagram code={String(children).replace(/\n$/, "")} />;
    }
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  },
};

export const MarkdownViewerComponent = (
  props: PiCardProps<MarkdownViewerProps>,
): React.ReactNode => {
  const {
    source,
    path,
    maxBodyLength = -1,
    remarkPlugins = [remarkMath, remarkGfm],
    rehypePlugins = [rehypeKatex, rehypeHighlight],
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
