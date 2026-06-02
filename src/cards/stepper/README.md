# shad/stepper — Styling Guide

This document describes every CSS class and custom property the stepper exposes so you can re-skin it without touching the component source.

---

## Architecture overview

The stepper uses a **two-layer** styling approach:

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Structural | **Tailwind** classes in `stepper.tsx` | Layout, flex, width, height, spacing — hard to override |
| Visual | **BEM** class names everywhere | Colours, borders, shadows, transitions — easy to override |

Default visual styles live in `stepper.css` (same directory, auto-imported by the card component).
Override any rule by loading your own stylesheet **after** the component, targeting the same BEM names.

---

## CSS custom properties

All properties are declared on `.pi-stepper` so they inherit into every child element.
Override them globally, per-size, or on a specific stepper instance.

```css
/* change globally */
.pi-stepper {
  --pi-stepper-indicator-size-sm:   1.5rem;   /* 24 px indicator for size="sm" */
  --pi-stepper-indicator-size-md:   2rem;     /* 32 px indicator for size="md" */
  --pi-stepper-indicator-size-lg:   2.5rem;   /* 40 px indicator for size="lg" */
  --pi-stepper-indicator-size:      var(--pi-stepper-indicator-size-md); /* active size */
  --pi-stepper-connector-thickness: 2px;      /* connector line width (horizontal) */
  --pi-stepper-connector-min-height: 1.5rem;  /* minimum connector height (vertical) */
  --pi-stepper-label-max-width:     6rem;     /* max label width (horizontal) */
}
```

### Per-instance override

```css
/* Only the stepper rendered by "app/wizard" */
[data-pihanga="app/wizard"] .pi-stepper {
  --pi-stepper-indicator-size-md: 2.75rem;   /* bigger indicators */
  --pi-stepper-connector-thickness: 4px;     /* thicker connector */
}
```

---

## BEM class reference

### Root (`<ol>`)

| Class | When applied |
|-------|-------------|
| `.pi-stepper` | always |
| `.pi-stepper--horizontal` | `orientation="horizontal"` (default) |
| `.pi-stepper--vertical` | `orientation="vertical"` |
| `.pi-stepper--sm` | `size="sm"` |
| `.pi-stepper--md` | `size="md"` (default) |
| `.pi-stepper--lg` | `size="lg"` |

```css
/* Make all horizontal steppers use a custom accent */
.pi-stepper--horizontal .pi-stepper__indicator--active {
  background-color: oklch(0.6 0.18 145);  /* custom green */
  ring-color: oklch(0.6 0.18 145);
}
```

---

### Step (`<li>`)

| Class | When applied |
|-------|-------------|
| `.pi-stepper__step` | every step item |
| `.pi-stepper__step--completed` | step index < activeStep |
| `.pi-stepper__step--active` | step index === activeStep |
| `.pi-stepper__step--upcoming` | step index > activeStep |
| `.pi-stepper__step--first` | first step |
| `.pi-stepper__step--last` | last step |

```css
/* Highlight the active step's entire column */
.pi-stepper__step--active {
  background-color: color-mix(in oklch, var(--primary) 5%, transparent);
  border-radius: 0.5rem;
}
```

---

### Indicator (step circle / button)

| Class | When applied |
|-------|-------------|
| `.pi-stepper__indicator` | the `<button>` element, always |
| `.pi-stepper__indicator--completed` | step is completed |
| `.pi-stepper__indicator--active` | step is active |
| `.pi-stepper__indicator--upcoming` | step is not yet reached |
| `.pi-stepper__indicator--clickable` | `onStepClick` prop is set |
| `.pi-stepper__indicator--static` | no click handler (display-only) |

> **⚠ Tailwind conflict note**
> The indicator's background colour, border, and ring are set by Tailwind classes in the JSX as defaults (`bg-primary`, `border-muted-foreground/40`, etc.).
> To override them reliably, raise specificity by one level or use `!important`.

```css
/* Completed step: swap to a teal background */
.pi-stepper .pi-stepper__indicator--completed {
  background-color: oklch(0.7 0.15 195) !important;
  color: white !important;
}

/* Active step: custom ring colour */
.pi-stepper .pi-stepper__indicator--active {
  background-color: oklch(0.55 0.2 260) !important;
  outline: 3px solid oklch(0.55 0.2 260) !important;
  outline-offset: 2px !important;
}

/* Upcoming: dashed border instead of solid */
.pi-stepper .pi-stepper__indicator--upcoming {
  border-style: dashed !important;
}

/* Hover state for clickable indicators */
.pi-stepper__indicator--clickable:hover {
  opacity: 0.75;
  transform: scale(1.05);
  transition: transform 150ms ease, opacity 150ms ease;
}
```

#### Indicator inner content

| Class | Element |
|-------|---------|
| `.pi-stepper__indicator-icon` | `<Check>` SVG shown when step is completed |
| `.pi-stepper__indicator-label` | `<span>` with the step number (1, 2, …) |

```css
/* Larger check mark */
.pi-stepper__indicator-icon {
  width: 60%;
  height: 60%;
}
```

---

### Connector (line between indicators)

| Class | When applied |
|-------|-------------|
| `.pi-stepper__connector` | every connector segment |
| `.pi-stepper__connector--left` | horizontal: left half of a step |
| `.pi-stepper__connector--right` | horizontal: right half of a step |
| `.pi-stepper__connector--vertical` | vertical: the line between two rows |
| `.pi-stepper__connector--completed` | the connected step is completed |
| `.pi-stepper__connector--upcoming` | the connected step is not yet reached |

```css
/* Animated gradient on completed connectors */
.pi-stepper__connector--completed {
  background: linear-gradient(
    to right,
    var(--primary),
    oklch(0.75 0.15 195)
  ) !important;
}

/* Dashed upcoming connector */
.pi-stepper__connector--upcoming {
  background: repeating-linear-gradient(
    to right,
    var(--border) 0, var(--border) 4px,
    transparent 4px, transparent 8px
  ) !important;
}

/* Thicker vertical connector */
.pi-stepper__connector--vertical {
  width: 3px !important;
}
```

---

### Label (text below/beside the indicator)

These classes are applied to the wrapper **and** the inner text elements, each carrying the same state modifier.

| Class | Element | When |
|-------|---------|------|
| `.pi-stepper__label` | wrapper `<div>` | text label, always |
| `.pi-stepper__label--completed` | wrapper | step completed |
| `.pi-stepper__label--active` | wrapper | step active |
| `.pi-stepper__label--upcoming` | wrapper | step upcoming |
| `.pi-stepper__label--vertical` | wrapper | vertical orientation |
| `.pi-stepper__label-title` | `<p>` title text | always |
| `.pi-stepper__label-title--completed` | title | step completed |
| `.pi-stepper__label-title--active` | title | step active |
| `.pi-stepper__label-title--upcoming` | title | step upcoming |
| `.pi-stepper__label-description` | `<p>` description text | when `description` is set |
| `.pi-stepper__label-optional` | `<p>` or `<span>` | when `optional: true` |

```css
/* Active step title: bold + primary colour */
.pi-stepper__label-title--active {
  font-weight: 700;
  color: var(--primary);
}

/* Completed step title: strikethrough effect */
.pi-stepper__label-title--completed {
  color: var(--muted-foreground);
}

/* Larger description text */
.pi-stepper__label-description {
  font-size: 0.75rem;
  color: var(--muted-foreground);
  margin-top: 2px;
}

/* Style the "Optional" badge */
.pi-stepper__label-optional {
  font-style: italic;
  color: var(--muted-foreground);
}
```

---

### Custom card label (when `labelCard` is set)

When a step has a `labelCard` prop, the text label is replaced by an arbitrary Pihanga card.
The wrapper `<div>` receives these classes instead of `.pi-stepper__label`:

| Class | When |
|-------|------|
| `.pi-stepper__label-card` | always (replaces `.pi-stepper__label`) |
| `.pi-stepper__label-card--completed` | step completed |
| `.pi-stepper__label-card--active` | step active |
| `.pi-stepper__label-card--upcoming` | step upcoming |
| `.pi-stepper__label-card--vertical` | vertical orientation |

```css
/* Give the custom label card a subtle highlight when active */
.pi-stepper__label-card--active {
  border-left: 3px solid var(--primary);
  padding-left: 0.5rem;
}
```

---

### Step content slot (vertical mode only)

| Class | When |
|-------|------|
| `.pi-stepper__step-content` | wrapper around `contentCard` content |

```css
/* Indent and add a left border to vertical step content */
.pi-stepper__step-content {
  border-left: 2px solid var(--border);
  padding-left: 1rem;
  margin-top: 0.75rem;
}
```

---

## Complete class tree

```
ol.pi-stepper
  .pi-stepper--horizontal | --vertical
  .pi-stepper--sm | --md | --lg

  li.pi-stepper__step
    .pi-stepper__step--completed | --active | --upcoming
    .pi-stepper__step--first | --last

    div.pi-stepper__connector          (horizontal left-half)
      .pi-stepper__connector--left
      .pi-stepper__connector--completed | --upcoming

    button.pi-stepper__indicator
      .pi-stepper__indicator--completed | --active | --upcoming
      .pi-stepper__indicator--clickable | --static
      ↳ svg.pi-stepper__indicator-icon   (completed)
      ↳ span.pi-stepper__indicator-label (active/upcoming)

    div.pi-stepper__connector          (horizontal right-half)
      .pi-stepper__connector--right
      .pi-stepper__connector--completed | --upcoming

    div.pi-stepper__label              (text label)
      .pi-stepper__label--completed | --active | --upcoming
      .pi-stepper__label--vertical
      p.pi-stepper__label-title
        .pi-stepper__label-title--completed | --active | --upcoming
        span.pi-stepper__label-optional  (inline, vertical mode)
      p.pi-stepper__label-optional       (block, horizontal mode)
      p.pi-stepper__label-description

    — OR —

    div.pi-stepper__label-card         (custom card label)
      .pi-stepper__label-card--completed | --active | --upcoming
      .pi-stepper__label-card--vertical

    div.pi-stepper__step-content       (vertical active step only)

    div.pi-stepper__connector          (vertical, between rows)
      .pi-stepper__connector--vertical
      .pi-stepper__connector--completed | --upcoming
```

---

## Color token note (Tailwind v4)

This project uses **Tailwind v4** with `oklch` color values.
CSS variable tokens (e.g. `--primary`, `--border`, `--muted-foreground`) are **raw `oklch(…)` strings**, not channel triplets.

```css
/* ✅ correct — use the variable directly */
color: var(--primary);
background-color: var(--border);

/* ❌ wrong — this is Tailwind v3 / HSL syntax */
color: hsl(var(--primary));
```

---

## Scoping overrides to a single card

Every stepper card wraps its output in `<div data-pihanga="{cardName}">`.
Use this attribute to scope styles to one instance without affecting others:

```css
/* Only the checkout stepper */
[data-pihanga="checkout/stepper"] .pi-stepper__indicator--active {
  background-color: oklch(0.7 0.18 35);  /* orange */
}

/* Only the wizard stepper */
[data-pihanga="wizard/stepper"] .pi-stepper__connector--completed {
  background-color: oklch(0.6 0.15 145);  /* green */
}
```
