export function createSlug(title: string, id?: string): string {
  const slugTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return id ? `${slugTitle}-${id}` : slugTitle;
}

export function extractIdFromSlug(slug: string): string {
  const lastHyphenIndex = slug.lastIndexOf("-");
  if (lastHyphenIndex === -1) return slug;
  return slug.substring(lastHyphenIndex + 1);
}
