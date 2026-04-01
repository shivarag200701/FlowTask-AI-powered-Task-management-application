import { Popover } from "@/features/ui/popover";
import type { Todo } from "@/types";
import {
  CopyPlus,
  Flag,
  MoreHorizontal,
  PencilLine,
  Trash2,
} from "lucide-react";
import { PriorityColors } from "@/utils/themes";

interface MoreOptionsPickerProps {
  todoId: number | string | null;
  openDropdownId: string | number | null;
  setOpenDropdownId: (id: number | string | null) => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPrioritySelect: (priority: Todo["priority"]) => void;
}

export function MoreOptionsPicker({
  todoId,
  openDropdownId,
  setOpenDropdownId,
  onEdit,
  onDelete,
  onDuplicate,
  onPrioritySelect,
}: MoreOptionsPickerProps) {
  const openPopover = todoId === openDropdownId;
  const setOpenPopover = (open: boolean) => {
    setOpenDropdownId(open ? todoId : null);
  };

  const onClose = () => {
    setOpenDropdownId(null);
  };
  return (
    <Popover
      content={
        <div>
          <button
            className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-3 cursor-pointer border-b border-border"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEdit();
              onClose();
            }}
          >
            <PencilLine className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <div className="text-foreground px-3 py-2 text-xs font-semibold">
            Priority
          </div>
          <div className="px-3 py-1 flex items-center gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  const priority =
                    index === 0
                      ? "high"
                      : index === 1
                        ? "medium"
                        : index === 2
                          ? "low"
                          : null;
                  onPrioritySelect(priority);
                }}
              >
                <Flag
                  className={`w-7 h-7 hover:bg-gray-800 p-[5px] rounded-md cursor-pointer ${PriorityColors[index === 0 ? "high" : index === 1 ? "medium" : index === 2 ? "low" : "none"]}`}
                  style={{
                    fill:
                      index === 0
                        ? "#DC2828"
                        : index === 1
                          ? "#3B82F6"
                          : index === 2
                            ? "#28A745"
                            : "none",
                  }}
                />
              </button>
            ))}
          </div>
          <button
            className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
              onClose();
            }}
          >
            <CopyPlus className="w-4 h-4" />
            <span>Duplicate</span>
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-red-400 transition-colors flex items-center gap-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              onClose();
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span className="text-red-500">Delete</span>
          </button>
        </div>
      }
      openPopover={openPopover}
      setOpenPopover={setOpenPopover}
    >
      <button
        type="button"
        className={`text-muted-foreground ${openPopover ? "bg-secondary" : ""} hover:text-foreground p-1 rounded-sm hover:bg-secondary/10 transition-colors cursor-pointer group-hover:bg-white border group-hover:border-border duration-300`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        title="More options"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </Popover>
  );
}
