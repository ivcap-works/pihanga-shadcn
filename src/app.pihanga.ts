import {
  memo,
  register,
  registerCard,
  registerFramework,
  type PiCardRef,
} from "@pihanga2/core";
import {SdFramework} from "./cards/framework";
import {PageWithNavbar} from "./cards/pageWithNavbar";
import {List} from "./cards/list";
import {FlexGrid} from "./cards/flexGrid";
import {Form} from "./cards/form";
import {Stack} from "./cards/stack";
import {Field} from "./cards/field";
import {Select} from "./cards/select";
import {DataTable, type DataTableRow} from "./cards/dataTable";
import {Typography} from "./cards/typography";
import {Stepper, onStepperStepClicked} from "./cards/stepper";
import {SdTabs} from "./cards/tabs";
import {ShadBadge} from "./cards/badge";
import {PiInput} from "./cards/input";
import {JsonViewer} from "./cards/jsonViewer";
import {ToggleGroup, onPiToggleGroupChanged} from "./cards/toggleGroup";
import {Switch, onPiSwitchChanged} from "./cards/switch";
import type {AppState} from "./app.state";

type MovieRow = DataTableRow<Record<string, unknown>>;

// ─── Controlled stepper: step clicks update global state ────────────────────
// `onStepperStepClicked` requires (register, reducer); wrap in register() so
// the PiRegister handle is available at module-init time.
register((r) => {
  onStepperStepClicked(r, (state: AppState, action) => {
    if (action.cardID === AppCard.StepperControlled) {
      state.stepperActiveStep = action.stepIndex;
    }
  });

  // ── ToggleGroup / Switch wiring demo ──────────────────────────────────────
  // These prove that global register() handlers correctly patch state when a
  // control widget carries `name:` in its props.  The playground uses the same
  // pattern for its interactive controls section.
  onPiToggleGroupChanged(r, (state: AppState, {name, value}) => {
    if (name === "demo-variant") {
      state.demoVariant = String(value);
    }
  });

  onPiSwitchChanged(r, (state: AppState, {name, checked}) => {
    if (name === "demo-notifications") {
      state.demoNotifications = checked;
    }
  });
});

export const AppCard = {
  Main: "app/main",

  List: "app/list",
  Content: "app/content",

  // Stepper demos
  StepperControlled: "app/stepper/controlled",

  // Data table demo
  MovieTable: "app/movies/table",
  /**
   * Single detail-card template shared by every row.
   * The DataTable renders it with `cardKey="detail-{rowId}"` and passes the
   * `row` object as a context prop, making it available to state mappers via
   * `ctx.ctxtProps.row`.
   */
  MovieDetailTemplate: "app/movies/row-detail",

  // Tabs demo
  TabsDemo: "app/tabs/demo",

  NavbarSearch: "app/navbar/search",
  LeftNav: "app/main/leftNav",
  RightNav: "app/main/rightNav",
  UserMenu: "app/main/userMenu",
  UserAvatar: "app/main/userAvatar",
};

// ---------------------------------------------------------------------------
// Movie detail cards (rendered below a row when expanded)
// ---------------------------------------------------------------------------

const MOVIES = [
  {
    id: "1",
    title: "Inception",
    year: 2010,
    genre: "Sci-Fi",
    rating: 8.8,
    released: "2010-07-16",
    watched: true,
    plot: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    director: "Christopher Nolan",
    stars: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
  },
  {
    id: "2",
    title: "The Godfather",
    year: 1972,
    genre: "Drama",
    rating: 9.2,
    released: "1972-03-24",
    watched: true,
    plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    director: "Francis Ford Coppola",
    stars: "Marlon Brando, Al Pacino, James Caan",
  },
  {
    id: "3",
    title: "Superbad",
    year: 2007,
    genre: "Comedy",
    rating: 7.6,
    released: "2007-08-17",
    watched: false,
    plot: "Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party fails.",
    director: "Greg Mottola",
    stars: "Jonah Hill, Michael Cera, Christopher Mintz-Plasse",
  },
  {
    id: "4",
    title: "Interstellar",
    year: 2014,
    genre: "Sci-Fi",
    rating: 8.6,
    released: "2014-11-07",
    watched: true,
    plot: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    director: "Christopher Nolan",
    stars: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
  },
  {
    id: "5",
    title: "Parasite",
    year: 2019,
    genre: "Thriller",
    rating: 8.5,
    released: "2019-05-30",
    watched: false,
    plot: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    director: "Bong Joon-ho",
    stars: "Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong",
  },
];

export function appPiInit(): void {
  registerFramework(
    SdFramework({
      page: AppCard.Main,
      theme: "light",
    }),
  );

  registerCard(
    AppCard.Main,
    PageWithNavbar({
      title: "Pihanga Demo",
      iconName: "mountain-snow",
      main: FlexGrid({
        cards: {
          list: AppCard.List,
          content: AppCard.Content,
        },
        template: {
          area: [["list", "content"]],
          columns: ["1fr", "4fr"],
          gap: "16px",
        },
        overflow: "auto",
      }),
    }),
  );

  registerCard(
    AppCard.List,
    List({
      items: [
        {id: "1", title: "First item"},
        {id: "2", title: "Second item"},
        {id: "3", title: "Third item"},
      ],
    }),
  );

  // ── Single detail-card template ──────────────────────────────────────────
  // Registered ONCE.  The DataTable renders it as:
  //   <Card cardName={row.detailCard}
  //         cardKey={`detail-${row.id}`}
  //         row={row}
  //         parentCard={cardName} />
  //
  // Pihanga creates a unique virtual instance per row (keyed by cardKey) and
  // makes `row` available to state-mapper functions via `ctx.ctxtProps.row`.
  //
  // This is just a NORMAL Stack card — no custom card type needed.
  // The `content` prop IS the state mapper: it receives ctxtProps and returns
  // an array of Typography card defs with the row-specific values baked in.
  registerCard(
    AppCard.MovieDetailTemplate,
    Stack({
      direction: "column",
      spacing: 1,
      // memo<P, T, S, C>:
      //   P = MovieRow | undefined  (extracted from ctxtProps)
      //   T = PiCardRef[]           (the content array)
      //   S = AppState
      //   C = { row?: MovieRow }    (ctxtProps shape passed by DataTable)
      //
      // The filter extracts `row` from ctxtProps; the mapper builds card defs
      // from the memoized row.  This is the idiomatic Pihanga pattern —
      // no custom card type, just memo + standard Stack/Typography cards.
      content: memo<
        MovieRow | undefined,
        PiCardRef[],
        AppState,
        {row?: MovieRow}
      >(
        (_, ctx) => ctx.ctxtProps?.row,
        (row) => {
          const d = (row?.data ?? {}) as Record<string, unknown>;
          return [
            Typography({level: "h4", text: String(d.title ?? "")}),
            Typography({
              level: "small",
              text: `Director: ${String(d.director ?? "")}`,
            }),
            Typography({
              level: "small",
              text: `Stars: ${String(d.stars ?? "")}`,
            }),
            Typography({level: "muted", text: String(d.plot ?? "")}),
          ];
        },
      ),
    }),
  );

  // ── Movie data table ─────────────────────────────────────────────────────
  registerCard(
    AppCard.MovieTable,
    DataTable({
      columns: [
        {key: "title", title: "Title", sortable: true},
        {
          key: "year",
          title: "Year",
          type: "number",
          sortable: true,
          align: "right",
          width: "80px",
        },
        {
          key: "genre",
          title: "Genre",
          type: "badge",
          variants: {
            "Sci-Fi": "default",
            Drama: "secondary",
            Comedy: "outline",
            Thriller: "destructive",
          },
        },
        {
          key: "rating",
          title: "Rating",
          type: "number",
          format: (n) => `★ ${n.toFixed(1)}`,
          align: "right",
          width: "80px",
          sortable: true,
        },
        {key: "released", title: "Released", type: "date", sortable: true},
        {
          key: "watched",
          title: "Watched",
          type: "boolean",
          align: "center",
          width: "80px",
        },
      ],
      rows: MOVIES.map((m) => ({
        id: m.id,
        // Include detail fields in row.data so state mappers can access them
        // via ctx.ctxtProps.row.data inside the detail template card.
        data: {
          title: m.title,
          year: m.year,
          genre: m.genre,
          rating: m.rating,
          released: m.released,
          watched: m.watched,
          director: m.director,
          stars: m.stars,
          plot: m.plot,
        },
        // All rows share the same template; cardKey makes each instance unique.
        detailCard: AppCard.MovieDetailTemplate,
      })),
      striped: true,
      hoverable: true,
      caption: "Click ▶ to expand a row and see movie details",
    }),
  );

  // ── Stepper demos ─────────────────────────────────────────────────────────

  const WIZARD_STEPS = [
    {id: "account", title: "Account", description: "Create your account"},
    {id: "profile", title: "Profile", description: "Set up your profile"},
    {id: "review", title: "Review", description: "Review and confirm"},
  ];

  // Self-managed: component tracks its own active step internally.
  // Clicking an indicator immediately advances the UI, no reducer needed.
  const stepperSelfManaged = Stepper({
    selfManaged: true,
    steps: WIZARD_STEPS,
    orientation: "horizontal",
  });

  // Controlled: active step is stored in app state and updated via reducer.
  // The registered reducer at the top of this file handles the action.
  registerCard(
    AppCard.StepperControlled,
    Stepper({
      activeStep: memo(
        (s: AppState) => s.stepperActiveStep,
        (v) => v ?? 0,
      ),
      steps: [
        {id: "cart", title: "Cart", description: "Review items"},
        {
          id: "ship",
          title: "Shipping",
          description: "Choose method",
          optional: true,
        },
        {id: "pay", title: "Payment", description: "Enter details"},
        {id: "confirm", title: "Confirm", description: "Place order"},
      ],
    }),
  );

  // ── Tabs demo ─────────────────────────────────────────────────────────────

  // Self-managed tabs: component tracks active tab internally.
  registerCard(
    AppCard.TabsDemo,
    SdTabs({
      selfManaged: true,
      tabs: [
        {
          id: "account",
          title: "Account",
          contentCard: Typography({
            level: "p",
            text: "Make changes to your account settings here.",
          }),
        },
        {
          id: "password",
          title: "Password",
          contentCard: Typography({
            level: "p",
            text: "Change your password and security preferences.",
          }),
        },
        {
          id: "notifications",
          title: "Notifications",
          contentCard: Typography({
            level: "p",
            text: "Configure how and when you receive notifications.",
          }),
        },
      ],
    }),
  );

  // ── Form demo ──────────────────────────────────────────────────────────────

  const colorOptions = ["red", "green", "blue"].map((v) => ({
    value: v,
    label: v,
  }));

  const form = Form({
    content: [
      Stack({
        content: [
          Field({
            label: "Favorite color",
            fieldCard: Select({
              name: "favoriteColor",
              options: colorOptions,
              selfManaged: true,
            }),
          }),
        ],
      }),
    ],
  });

  // ── Assemble content area ─────────────────────────────────────────────────
  registerCard(
    AppCard.Content,
    Stack({
      direction: "column",
      spacing: 4,
      content: [
        // ════════════════════════════════════════════════════════════════════
        // CONTROL WIRING DEMO — proves ToggleGroup + Switch patch state via
        // global register() handlers (same mechanism used in playground.pihanga.ts)
        // ════════════════════════════════════════════════════════════════════
        Typography({
          level: "h4",
          text: "Control wiring demo — ToggleGroup → Badge variant",
        }),
        Stack({
          direction: "column",
          spacing: 3,
          className: "rounded-lg border p-4",
          content: [
            // ── Row 1: ToggleGroup selects a badge variant ────────────────
            Stack({
              direction: "row",
              alignItems: "center",
              spacing: 4,
              content: [
                Typography({
                  level: "small",
                  text: "Variant",
                  className: "w-20 shrink-0 text-muted-foreground",
                }),
                ToggleGroup({
                  name: "demo-variant",
                  type: "single",
                  items: ["default", "secondary", "destructive", "outline"].map(
                    (v) => ({value: v, label: v}),
                  ),
                  value: memo(
                    (s: AppState) => s.demoVariant ?? "default",
                    (v) => v,
                  ),
                  variant: "outline",
                  size: "sm",
                  spacing: 0,
                }),
              ],
            }),
            // ── Live Badge preview ─────────────────────────────────────────
            Stack({
              direction: "row",
              alignItems: "center",
              spacing: 4,
              content: [
                Typography({
                  level: "small",
                  text: "Result",
                  className: "w-20 shrink-0 text-muted-foreground",
                }),
                ShadBadge({
                  label: memo(
                    (s: AppState) => s.demoVariant ?? "default",
                    (v) => `Badge: ${v}`,
                  ),
                  variant: memo(
                    (s: AppState) => s.demoVariant ?? "default",
                    (v) =>
                      v as "default" | "secondary" | "destructive" | "outline",
                  ),
                }),
              ],
            }),
            // ── Row 2: Switch toggles notifications ───────────────────────
            Stack({
              direction: "row",
              alignItems: "center",
              spacing: 4,
              content: [
                Typography({
                  level: "small",
                  text: "Notifications",
                  className: "w-20 shrink-0 text-muted-foreground",
                }),
                Switch({
                  name: "demo-notifications",
                  checked: memo(
                    (s: AppState) => s.demoNotifications,
                    (v) => v ?? false,
                  ),
                  label: memo(
                    (s: AppState) => s.demoNotifications,
                    (v) => (v ? "✅ Enabled" : "🔕 Disabled"),
                  ),
                }),
              ],
            }),
          ],
        }),
        // ════════════════════════════════════════════════════════════════════
        Typography({
          level: "h4",
          text: "Stepper — self-managed (click any step)",
        }),
        stepperSelfManaged,
        Typography({
          level: "h4",
          text: "Stepper — controlled (state-driven, click any step)",
        }),
        AppCard.StepperControlled,
        Typography({level: "h4", text: "Tabs — self-managed"}),
        AppCard.TabsDemo,
        Typography({level: "h4", text: "Badge — all variants"}),
        Stack({
          direction: "row",
          spacing: 2,
          content: [
            ShadBadge({label: "Default", variant: "default"}),
            ShadBadge({label: "Secondary", variant: "secondary"}),
            ShadBadge({label: "Destructive", variant: "destructive"}),
            ShadBadge({label: "Outline", variant: "outline"}),
          ],
        }),
        AppCard.MovieTable,
        form,
        Typography({level: "h4", text: "JSON Viewer"}),
        JsonViewer({
          source: {
            name: "Alice",
            age: 30,
            active: true,
            address: {street: "123 Main St", city: "Springfield"},
            tags: ["admin", "editor"],
          },
          collapsed: 1,
        }),
        Typography({level: "h4", text: "Input — shadcn variants"}),
        Stack({
          direction: "column",
          spacing: 3,
          content: [
            PiInput({
              label: "Email",
              type: "email",
              placeholder: "you@example.com",
            }),
            PiInput({
              label: "Password",
              type: "password",
              placeholder: "••••••••",
            }),
            PiInput({
              label: "Username",
              placeholder: "johndoe",
              description: "This is your public display name.",
            }),
            PiInput({
              label: "Disabled",
              placeholder: "You cannot edit this",
              disabled: true,
            }),
            PiInput({
              label: "Upload a file",
              type: "file",
            }),
          ],
        }),
      ],
    }),
  );
}
