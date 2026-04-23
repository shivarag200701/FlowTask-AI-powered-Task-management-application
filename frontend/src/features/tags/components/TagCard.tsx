import TagBadge from "@/components/TagBadge";
import { Button } from "@/components/ui/button";
import type { Tag } from "@/types";
import pluralize from "@/utils/pluralize";
import { ListTodo, MoreVerticalIcon } from "lucide-react";

function TagCard({ tag }: { tag: Tag }) {
  const todoCount = tag._count?.todos;
  return (
    <div className="flex justify-between items-center py-2.5 px-4">
      <div className="flex gap-3 text-sm items-center">
        <TagBadge color={tag.color} withIcon />
        {tag.name}
      </div>
      <div className="flex gap-10 items-center">
        <Button
          variant="outline"
          Initial={`${tag._count.todos} ${pluralize("task", todoCount)}`}
          size="sm"
          className="w-[80px] bg-accent/50"
          icon={<ListTodo />}
        />
        <MoreVerticalIcon className="w-5 h-5" strokeWidth={1.5} />
      </div>
    </div>
  );
}

export default TagCard;
