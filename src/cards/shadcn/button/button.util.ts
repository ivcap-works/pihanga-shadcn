import type {SizeT, VariantT} from "@pihanga2/cards";

export function toVariant(
  variant: VariantT | undefined
): "default" | "outline" | "ghost" | "destructive" | "secondary" | "link" {
  if (!variant) return "default";
  switch (variant) {
    // "outlined" | "plain" | "soft" | "solid"
    case "solid":
      return "default";
    case "outlined":
      return "outline";
    case "plain":
      return "outline";
    case "soft":
      return "ghost";
    default:
      return "default";
  }
}

export function toSize(
  size: SizeT | undefined
): "lg" | "sm" | "default" | "icon" {
  let s: "lg" | "sm" | "default" | "icon" = "default";
  if (size) {
    // SizeT: "lg" | "md" | "sm"
    switch (size) {
      case "lg":
        s = "lg";
        break;
      case "sm":
        s = "sm";
        break;
    }
  }
  return s;
}
