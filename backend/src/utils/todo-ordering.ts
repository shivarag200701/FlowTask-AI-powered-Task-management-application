import { generateKeyBetween } from "fractional-indexing";

export function generateSortKey(prev: string, after: string) {
  return generateKeyBetween(prev, after);
}
