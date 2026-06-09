import type { TagProps } from "@/types";
import { Tag } from "lucide-react";

export function getTagOption(tag: TagProps) {
  return {
    value: tag.id,
    label: tag.name,
    meta: {
      color: tag.color,
      count: tag._count,
    },
    icon: <Tag className="size-3.5" />,
  };
}
