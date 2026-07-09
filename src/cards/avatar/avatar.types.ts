import {createCardDeclaration} from "@pihanga2/core";

export const AVATAR_CARD = "shad/avatar";

/**
 * Avatar size tokens — map to Tailwind `size-*` utilities.
 *
 * | Value  | Tailwind   | px  |
 * |--------|-----------|-----|
 * | `"sm"` | `size-6`  | 24  |
 * | `"md"` | `size-8`  | 32  |
 * | `"lg"` | `size-12` | 48  |
 * | `"xl"` | `size-16` | 64  |
 */
export type AvatarSize = "sm" | "md" | "lg" | "xl";

export type AvatarCardProps = {
  /**
   * URL of the avatar image.
   * When omitted or the image fails to load, `fallback` is shown instead.
   */
  src?: string;

  /** Accessible alt text for the image. */
  alt?: string;

  /**
   * Text rendered inside the fallback circle when no image is available.
   * Typically one or two initials, e.g. `"JD"`.
   */
  fallback?: string;

  /**
   * Avatar diameter.
   * @default "md"
   */
  size?: AvatarSize;

  /** Additional Tailwind classes applied to the root `<span>` element. */
  className?: string;
};

/**
 * Factory function for declaring a `shad/avatar` card instance.
 *
 * ```ts
 * import {ShadAvatar} from "@/cards/avatar";
 *
 * registerCard("myApp/userAvatar", ShadAvatar({
 *   src: memo((s: AppState) => s.user.avatarUrl),
 *   fallback: memo((s: AppState) => s.user.initials),
 * }));
 * ```
 */
export const ShadAvatar = createCardDeclaration<AvatarCardProps>(AVATAR_CARD);
