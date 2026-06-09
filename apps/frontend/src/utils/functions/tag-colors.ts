import {
  RESOURCE_COLORS_DATA,
  type ResourceColorsEnum,
  RESOURCE_COLORS,
} from "@shiva200701/todotypes";

export function getResourceColors({ color }: { color: ResourceColorsEnum }) {
  return RESOURCE_COLORS_DATA.find((resource) => color === resource.color);
}

export function getRandomTagColor(): ResourceColorsEnum {
  return RESOURCE_COLORS[Math.floor(Math.random() * RESOURCE_COLORS.length)];
}
