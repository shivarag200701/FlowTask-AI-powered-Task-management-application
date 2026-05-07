import type { TodoTag } from "@/types";
import { Tag } from "lucide-react";

export function getTagOption(tag: TodoTag) {
  return {
    value: tag.id,
    label: tag.name,
    meta: {
      color: tag.color,
    },
    icon: <Tag className="size-3.5" />,
  };
}
