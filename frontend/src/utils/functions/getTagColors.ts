import {
  RESOURCE_COLORS_DATA,
  type ResourceColorsEnum,
} from "@shiva200701/todotypes";

export function getResourceColors({ color }: { color: ResourceColorsEnum }) {
  return RESOURCE_COLORS_DATA.find((resource) => color === resource.color);
}
