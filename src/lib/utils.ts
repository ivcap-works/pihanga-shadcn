import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns "#000000" or "#ffffff" for maximum contrast against the given background color (hex or rgb).
 *
 * Based on WCAG relative luminance, which models human visual perception:
 *   L = 0.2126·R + 0.7152·G + 0.0722·B
 *
 * The weights reflect how sensitive our eyes are to each channel —
 * green contributes 71% of perceived brightness, red ~21%, blue only 7%.
 * This means a vivid red like #c0392b is perceptually *dim* (L≈0.11), so
 * white text (contrast 8.7:1) beats black text (2.4:1) against it.
 *
 * The threshold L > 0.179 is the luminance midpoint where both black and
 * white achieve ~4.5:1 contrast — the WCAG AA minimum.
 */
export function contrastColor(
  bg: string,
  threshold = 0.179,
): "#000000" | "#ffffff" {
  const m = bg.match(/\w\w/g) ?? bg.match(/\d+/g);
  const [r, g, b] = bg.startsWith("#")
    ? (bg.length === 4
        ? [bg[1] + bg[1], bg[2] + bg[2], bg[3] + bg[3]]
        : [bg.slice(1, 3), bg.slice(3, 5), bg.slice(5, 7)]
      ).map((h) => parseInt(h, 16))
    : (m ?? []).map(Number);
  // WCAG relative luminance
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L > threshold ? "#000000" : "#ffffff";
}
