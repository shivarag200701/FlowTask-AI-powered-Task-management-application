import { generateKeyBetween } from "fractional-indexing";

export function generateSortKey(prev: string | null, after: string | null) {
  return generateKeyBetween(prev, after);
}
