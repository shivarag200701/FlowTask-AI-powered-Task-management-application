import MoreTagOptionsDropDown from "@/components/popovers/MoreTagOptionsDropDown";
import TagBadge from "@/components/TagBadge";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import type { TagProps } from "@/types";
import pluralize from "@/utils/functions/pluralize";
import { ListTodo, MoreVertical } from "lucide-react";
import { useState } from "react";

function TagCard({
  tag,
  onEdit,
}: {
  tag: TagProps;
  onEdit: (tag: TagProps) => void;
}) {
  const todoCount = tag._count?.todos;
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
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
        <Popover
          openPopover={isMoreOptionsOpen}
          setOpenPopover={setIsMoreOptionsOpen}
          content={
            <MoreTagOptionsDropDown
              onDelete={() => {
                setIsMoreOptionsOpen(false);
              }}
              onEdit={() => {
                setIsMoreOptionsOpen(false);
                onEdit(tag);
              }}
            />
          }
          sideOffset={5}
          side="bottom"
          align="end"
        >
          <Button
            variant="custom"
            className="w-fit"
            icon={<MoreVertical color="#808080" strokeWidth={2.5} />}
            size="icon-sm"
          />
        </Popover>
      </div>
    </div>
  );
}

export default TagCard;
