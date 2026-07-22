/**
 * vite.extras.config.ts
 *
 * Vite library-mode config for building individual "extra" card packages:
 *   @pihanga2/graphin   (PIHANGA_EXTRA_KEY=graphin)
 *   @pihanga2/chart     (PIHANGA_EXTRA_KEY=chart)
 *   @pihanga2/markdown  (PIHANGA_EXTRA_KEY=markdown)
 *
 * Invoked exclusively by scripts/build-extras.mjs — do not call directly.
 *
 *   PIHANGA_EXTRA_KEY=graphin npx vite build --config vite.extras.config.ts
 */

import path from "path";
import {readFileSync} from "fs";
import {fileURLToPath} from "url";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import {defineConfig} from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Resolve which extra package to build
// ---------------------------------------------------------------------------

const PKG_KEY = process.env.PIHANGA_EXTRA_KEY;
if (!PKG_KEY) {
  throw new Error(
    "PIHANGA_EXTRA_KEY env var is required (e.g. graphin | chart | markdown)",
  );
}

interface ExtraPackage {
  name: string;
  key: string;
  cards: string[];
  outDir: string;
  description: string;
}

const {packages}: {packages: ExtraPackage[]} = JSON.parse(
  readFileSync(path.join(__dirname, "scripts/extra-packages.json"), "utf-8"),
);

const pkg = packages.find((p) => p.key === PKG_KEY);
if (!pkg) {
  const valid = packages.map((p) => p.key).join(" | ");
  throw new Error(
    `No extra package found for key "${PKG_KEY}". Valid keys: ${valid}`,
  );
}

// ---------------------------------------------------------------------------
// Entry points — one per card in this package
// ---------------------------------------------------------------------------

const entry: Record<string, string> = {};
for (const card of pkg.cards) {
  entry[`cards/${card}/index`] = path.resolve(
    __dirname,
    `src/cards/${card}/index.ts`,
  );
}

// ---------------------------------------------------------------------------
// External dependencies — never bundled into the output
//
// Card-specific heavy deps (recharts, @antv/*, mermaid, etc.) are marked
// external here AND declared as `dependencies` in the generated package.json
// so npm installs them automatically for consumers.
// ---------------------------------------------------------------------------

const external = [
  // ── Peer deps ────────────────────────────────────────────────────────────
  "react",
  "react/jsx-runtime",
  "react-dom",
  "@pihanga2/core",
  "@pihanga2/cards",
  // ── Radix UI ──────────────────────────────────────────────────────────────
  /^@radix-ui\//,
  /^radix-ui/,
  // ── Shared light runtime deps ─────────────────────────────────────────────
  "lucide-react",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
  "sonner",
  // ── Graphin / graph card deps ─────────────────────────────────────────────
  /^@antv\//,
  "lodash",
  // ── Chart card deps ───────────────────────────────────────────────────────
  "recharts",
  // ── Markdown card deps ────────────────────────────────────────────────────
  /^react-markdown/,
  /^remark/,
  /^rehype/,
  /^unified/,
  "mermaid",
  /^highlight\.js/,
  // ── CodeMirror card deps ──────────────────────────────────────────────────
  /^@uiw\/react-codemirror/,
  /^@uiw\/codemirror/,
  /^@codemirror\//,
  "codemirror",
  // ── Other optional card deps (guard) ─────────────────────────────────────
  "react-resizable-panels",
  "react-json-view-lite",
  "react-drag-drop-files",
  "date-fns",
  /^react-day-picker/,
];

// ---------------------------------------------------------------------------
// Vite config
// ---------------------------------------------------------------------------

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: [
        // Only the cards in THIS package — not every card in src/cards/
        ...pkg.cards.map((c) => `src/cards/${c}`),
        "src/lib",
        "src/components/theme-provider",
        "src/components/hooks",
      ],
      exclude: [
        "src/**/*.example.ts",
        "src/**/*.test.tsx",
        "src/playground/**",
        "src/app.*",
        "src/main.ts",
        "src/vite-env.d.ts",
      ],
      outDir: pkg.outDir,
      rollupTypes: false,
      tsconfigPath: "./tsconfig.json",
    }),
  ],

  resolve: {
    alias: [
      {find: "@/lib", replacement: path.resolve(__dirname, "./src/lib")},
      {
        find: "@/registry",
        replacement: path.resolve(__dirname, "./src/components"),
      },
      {find: "@", replacement: path.resolve(__dirname, "./src")},
    ],
  },

  // Do not copy public/ into the dist output (registry JSON / playground only)
  publicDir: false,

  build: {
    lib: {
      entry,
      formats: ["es"],
    },
    rollupOptions: {
      external,
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
    outDir: pkg.outDir,
    sourcemap: true,
    emptyOutDir: true,
  },
});
