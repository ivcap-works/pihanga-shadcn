import {
  registerMetaCard,
  type PiCardDef,
  type PiCardRef,
  type PiMetaProps,
  type PiMetaResolveCtx,
  type PiRegisterMetaCard,
  type RegisterCardF,
} from "@pihanga2/core";

import {Stack} from "@/cards/stack";
import {Box} from "@/cards/box";
import {Button} from "@/cards/button";
import {Typography} from "@/cards/typography";
import {Conditional} from "@/cards/conditional";
import {Drawer} from "@/cards/drawer";

import {
  PAGE_WITH_NAVBAR_META_ACTION,
  PI_PAGE_WITH_NAVBAR_META_CARD,
  type NavLink,
  type PageWithNavbarMetaDynProps,
  type PageWithNavbarMetaEvents,
  type PageWithNavbarMetaStaticProps,
} from "./pageWithNavbarMeta.types";

export * from "./pageWithNavbarMeta.types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s ? s.charAt(0).toLocaleUpperCase() + s.slice(1) : "";
}

// ── Mapper ───────────────────────────────────────────────────────────────────

/**
 * `StaticProps` arrive as their plain types — TypeScript refuses memo selectors.
 * `DynProps` arrive as `StateMapper<T>` functions — must be resolved via `resolve()`.
 */
type MapperProps = PiMetaProps<
  PageWithNavbarMetaDynProps,
  PageWithNavbarMetaStaticProps,
  PageWithNavbarMetaEvents
>;

function PageWithNavbarMetaMapper(
  _cardName: string,
  props: MapperProps,
  reg: RegisterCardF,
): PiCardDef {
  // ── Static props: plain types, no resolve() needed ───────────────────────
  const navLinks = props.navLinks ?? [];
  const iconName = props.iconName;
  const wrapperClass = props.className;
  const footer = props.footer;

  // ── Title (icon + text) ─────────────────────────────────────────────────
  // props.title is StateMapper<string> — a function, NOT a string.
  // Typography's `text` prop is typed (via PiMapProps) as `string | StateMapper<string>`,
  // so we forward the selector function directly.  The framework resolves it lazily
  // (calls props.title(state, ctx)) when Typography renders.  This is different from
  // using props.title as a string, which TypeScript would reject.
  const titleContent: PiCardRef[] = [];
  if (iconName) {
    titleContent.push(
      Button({
        iconLabel: iconName,
        opts: {variant: "none", size: "icon"},
        className: "h-6 w-6 shrink-0 pointer-events-none",
      }),
    );
  }
  titleContent.push(
    Typography({
      text: props.title,
      level: "large",
      className: "leading-none",
    }),
  );

  const titleStack = reg(
    "title",
    Stack({
      direction: "row",
      alignItems: "center",
      spacing: 2,
      content: titleContent,
    }),
  );

  // ── Nav link buttons (shared between desktop and mobile) ────────────────
  const linkButtons = navLinks.map((link: NavLink, i: number) =>
    reg(
      `nav-link-${i}`,
      Button({
        id: link.id,
        label: link.title ?? capitalize(link.id),
        opts: {variant: "ghost"},
        className:
          "px-0 text-muted-foreground hover:text-foreground h-auto p-0",
        onClickedMapper: () => ({
          type: PAGE_WITH_NAVBAR_META_ACTION.NAVIGATE_TO,
          id: link.id,
        }),
      }),
    ),
  );

  // ── Desktop nav (md+): title + links in a row ───────────────────────────
  const desktopNav = reg(
    "nav-md",
    Conditional({
      showOn: "md",
      content: reg(
        "nav-md-inner",
        Stack({
          direction: "row",
          alignItems: "center",
          spacing: 5,
          content: [titleStack, ...linkButtons],
        }),
      ),
    }),
  );

  // ── Mobile nav (< md) ───────────────────────────────────────────────────
  // With nav links: hamburger drawer (left slide-in using pi/drawer).
  // Without nav links: just show the title inline.
  const mobileNav: PiCardRef =
    navLinks.length > 0
      ? reg(
          "nav-sm",
          Conditional({
            showOn: "<md",
            content: reg(
              "nav-sm-drawer",
              Drawer({
                direction: "left",
                trigger: Button({
                  iconLabel: "menu",
                  opts: {variant: "outline", size: "icon"},
                  ariaLabel: "Toggle navigation menu",
                }),
                content: reg(
                  "nav-sm-content",
                  Stack({
                    direction: "column",
                    spacing: 4,
                    className: "p-4",
                    content: [titleStack, ...linkButtons],
                  }),
                ),
                footerCloseButtonText: null,
              }),
            ),
          }),
        )
      : reg(
          "nav-sm-title",
          Conditional({
            showOn: "<md",
            content: titleStack,
          }),
        );

  // ── Header action slots ─────────────────────────────────────────────────
  // Static PiCardRefs — TypeScript already refuses memo() selectors here.
  const actionRefs: PiCardRef[] = [];
  if (props.headerLeftCard) {
    actionRefs.push(props.headerLeftCard);
  }
  if (props.headerRightCard) {
    actionRefs.push(props.headerRightCard);
  }

  const headerContent: PiCardRef[] = [desktopNav, mobileNav];
  if (actionRefs.length > 0) {
    headerContent.push(
      reg(
        "header-actions",
        Stack({
          direction: "row",
          alignItems: "center",
          className: "ml-auto gap-2 lg:gap-4",
          content: actionRefs,
        }),
      ),
    );
  }

  // ── Header ──────────────────────────────────────────────────────────────
  const header = reg(
    "header",
    Box({
      className:
        "shrink-0 flex items-center gap-4 border-b bg-background px-4 md:px-6",
      content: headerContent,
    }),
  );

  // ── Main ────────────────────────────────────────────────────────────────
  // props.main is a StateMapper — resolved lazily so React re-renders when
  // the referenced card changes.
  const mainBox = reg(
    "main",
    Box({
      className:
        "flex-1 min-h-0 overflow-y-auto bg-background p-4 py-2 md:p-8 md:py-4",
      content: ((_: unknown, ctx: PiMetaResolveCtx) => {
        const ref = ctx.resolve(props.main);
        return ref != null ? [ref as PiCardRef] : [];
      }) as unknown as PiCardRef[],
    }),
  );

  // ── Page column ─────────────────────────────────────────────────────────
  const pageContent: PiCardRef[] = [header, mainBox];

  // ── Footer (optional) ───────────────────────────────────────────────────
  // `footer` is a static plain PiCardRef — use directly.
  if (footer) {
    pageContent.push(
      reg(
        "footer",
        Box({
          className:
            "shrink-0 bg-background text-muted-foreground px-4 py-2 md:px-8 md:py-4",
          content: [footer],
        }),
      ),
    );
  }

  // ── Assemble ────────────────────────────────────────────────────────────
  return Stack({
    direction: "row",
    className: `w-full h-full justify-center${wrapperClass ? ` ${wrapperClass}` : ""}`,
    content: [
      reg(
        "page",
        Stack({
          direction: "column",
          className: "flex-1 h-full w-full",
          content: pageContent,
        }),
      ),
    ],
  });
}

// ── Registration ─────────────────────────────────────────────────────────────

registerMetaCard({
  type: PI_PAGE_WITH_NAVBAR_META_CARD,
  mapper: PageWithNavbarMetaMapper,
  events: PAGE_WITH_NAVBAR_META_ACTION,
} satisfies PiRegisterMetaCard);
