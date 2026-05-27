export function createTodoSlug(title: string, id: string): string {
  const slugTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${slugTitle}-${id}`;
}

export function extractIdFromSlug(slug: string): string {
  const lastHyphenIndex = slug.lastIndexOf("-");
  if (lastHyphenIndex === -1) return slug;
  return slug.substring(lastHyphenIndex + 1);
}
