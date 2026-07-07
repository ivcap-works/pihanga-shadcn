import {Menu} from "lucide-react";
import clsx from "clsx";
import {useEffect, useRef, useState} from "react";

import {Button} from "@/components/ui/button";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {Card, type PiCardProps} from "@pihanga2/core";
import {getIconElement} from "@/cards/icons";
import {ScreenSize, SCREEN_SIZE_ORDER, SCREEN_SIZE_WIDTHS} from "@/cards/types";
import type {
  PageWithNavbarEvents,
  PageWithNavbarProps,
  ResponsiveCardRef,
} from "./pageWithNavbar.type";
import type {SizeMap} from "@/cards/types";
import type {PiCardRef} from "@pihanga2/core";

import "./pageWithNavbar.css";

// ---------------------------------------------------------------------------
// Style override type — consumers can extend this to add Tailwind class names
// to any structural section of the layout.
// ---------------------------------------------------------------------------

export type ShadStyle = {
  window?: string;
  page?: string;
  header?: string;
  main?: string;
  footer?: string;
};

// ---------------------------------------------------------------------------
// Screen-size hook
// ---------------------------------------------------------------------------

function getCurrentScreenSize(): ScreenSize {
  const w = typeof window !== "undefined" ? window.innerWidth : 0;
  // Walk breakpoints from largest to smallest
  for (let i = SCREEN_SIZE_ORDER.length - 1; i >= 0; i--) {
    const size = SCREEN_SIZE_ORDER[i];
    if (w >= SCREEN_SIZE_WIDTHS[size]) return size;
  }
  return ScreenSize.XS;
}

function useScreenSize(): ScreenSize {
  const [size, setSize] = useState<ScreenSize>(getCurrentScreenSize);

  useEffect(() => {
    const handleResize = () => setSize(getCurrentScreenSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

// ---------------------------------------------------------------------------
// Responsive card-ref resolution
// ---------------------------------------------------------------------------

function isSizeMap(ref: ResponsiveCardRef): ref is SizeMap<PiCardRef> {
  return typeof ref === "object" && ref !== null;
}

/**
 * Resolve a {@link ResponsiveCardRef} to a concrete `PiCardRef` (or
 * `undefined`) for the given screen size.
 *
 * Uses a **mobile-first cascade**: the entry with the largest breakpoint
 * that is still ≤ `currentSize` wins; falls back to `default` otherwise.
 */
function resolveCardRef(
  ref: ResponsiveCardRef | undefined,
  currentSize: ScreenSize,
): PiCardRef | undefined {
  if (!ref) return undefined;
  if (!isSizeMap(ref)) return ref; // plain PiCardRef (string or PiCardDef)

  // Cascade: find the highest breakpoint that is ≤ current size
  const currentIdx = SCREEN_SIZE_ORDER.indexOf(currentSize);
  for (let i = currentIdx; i >= 0; i--) {
    const size = SCREEN_SIZE_ORDER[i];
    if (Object.prototype.hasOwnProperty.call(ref, size)) {
      const val = ref[size];
      // null means "explicitly hidden at this breakpoint"
      return val ?? undefined;
    }
  }
  // Fall back to the default entry
  return ref.default ?? undefined;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Component = (
  props: PiCardProps<PageWithNavbarProps<ShadStyle>, PageWithNavbarEvents>,
): React.ReactNode => {
  const {
    title,
    iconName,
    main,
    footer,
    navLinks = [],
    scrollResetKey,
    headerLeftCard,
    headerRightCard,
    style,
    onNavigateTo,
    cardName,
  } = props;

  const screenSize = useScreenSize();
  const cl = style ?? {};
  const mainRef = useRef<HTMLElement | null>(null);

  // Scroll main back to top when the logical "page" changes
  useEffect(() => {
    mainRef.current?.scrollTo({top: 0, behavior: "auto"});
  }, [scrollResetKey]);

  const resolvedLeftCard = resolveCardRef(headerLeftCard, screenSize);
  const resolvedRightCard = resolveCardRef(headerRightCard, screenSize);
  const hasNavLinks = navLinks.length > 0;

  // ------------------------------------------------------------------
  // Sub-components
  // ------------------------------------------------------------------

  /** Title section: optional icon + text */
  function TitleSection({className}: {className?: string}) {
    const IconEl = iconName ? getIconElement(iconName) : undefined;
    return (
      <div className={clsx("title-section", className)}>
        {IconEl && <IconEl className="title-icon" aria-hidden />}
        <span className="title-text">{title}</span>
      </div>
    );
  }

  /** Nav bar rendered on medium screens and above */
  function NavMd() {
    return (
      <nav className="nav-md" aria-label="Main navigation">
        <TitleSection />
        {navLinks.map((el) => (
          <Button
            key={el.id}
            onClick={() => onNavigateTo({id: el.id})}
            variant="link"
            className="nav-link"
          >
            {el.title ?? capitalize(el.id)}
          </Button>
        ))}
      </nav>
    );
  }

  /** Hamburger trigger that opens a slide-out sheet on small screens */
  function NavSm() {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="nav-sm" aria-label="Mobile navigation">
            <TitleSection />
            {navLinks.map((el) => (
              <Button
                key={el.id}
                onClick={() => onNavigateTo({id: el.id})}
                variant="link"
                className="nav-link"
              >
                {el.title ?? capitalize(el.id)}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  // ------------------------------------------------------------------
  // Layout
  // ------------------------------------------------------------------

  return (
    <div className={clsx("window", cl.window)} data-pihanga={cardName}>
      <div className={clsx("page", cl.page)}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className={clsx("header", cl.header)}>
          {/* Medium+ nav (title + links) */}
          <NavMd />

          {/* Small-screen hamburger (only when there are nav links) */}
          {hasNavLinks && <NavSm />}

          {/* On small screens with no nav links, show the title inline.
              Wrap in a plain div so md:hidden isn't overridden by the
              .title-section CSS class that sets display:inline-flex. */}
          {!hasNavLinks && (
            <div className="md:hidden">
              <TitleSection />
            </div>
          )}

          {/* Push action cards to the right */}
          <div className="header-actions">
            {resolvedLeftCard && (
              <Card cardName={resolvedLeftCard} parentCard={cardName} />
            )}
            {resolvedRightCard && (
              <Card cardName={resolvedRightCard} parentCard={cardName} />
            )}
          </div>
        </header>

        {/* ── Main ───────────────────────────────────────────────── */}
        <main className={clsx("main", cl.main)} ref={mainRef}>
          <Card cardName={main} parentCard={cardName} />
        </main>

        {/* ── Footer (optional) ──────────────────────────────────── */}
        {footer && (
          <footer className={clsx("footer", cl.footer)}>
            <Card cardName={footer} parentCard={cardName} />
          </footer>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toLocaleUpperCase() + str.slice(1);
}
