import MoreTagOptionsDropDown from "@/components/popovers/MoreTagOptionsDropDown";
import TagBadge from "@/components/TagBadge";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import type { TagProps } from "@/types";
import pluralize from "@/utils/functions/pluralize";
import { ListTodo, MoreVertical } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTagSelectionContext } from "../TagSelectionContext";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

function TagCard({
  tag,
  onEdit,
  onSelect,
}: {
  tag: TagProps;
  onEdit: (tag: TagProps) => void;
  onSelect?: (tagId: TagProps["id"]) => void;
}) {
  const todoCount = tag._count?.todos;
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

  const navigate = useNavigate();

  const { selectedTags, isSelectMode } = useTagSelectionContext();

  const { isMobile } = useMediaQuery();

  const tagSelected = useMemo(() => {
    return selectedTags?.includes(tag.id);
  }, [selectedTags]);

  //
  const todoPageUrl = `/app/todos?tagIds=${tag.id}`;
  return (
    <div
      className={cn(
        "flex justify-between items-center py-2.5 px-4 select-none",
        tagSelected && "border-l-4 border-l-primary pl-3"
      )}
      onClick={(e) => {
        if (e.shiftKey) {
          e.preventDefault();
          onSelect?.(tag.id);
          return;
        } else if (isSelectMode && isMobile) {
          e.preventDefault();
          onSelect?.(tag.id);
          return;
        }
        navigate(todoPageUrl);
      }}
    >
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
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </Popover>
      </div>
    </div>
  );
}

export default TagCard;
