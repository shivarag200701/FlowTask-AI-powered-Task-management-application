import { Popover } from "@/Components/ui/popover";
import type { Todo } from "@/types";
import { cn } from "@/lib/utils";
import { Check, Flag, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
interface PriorityPickerProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  priority?: Todo["priority"];
  className?: string;
  onPriorityChange: (priority: Todo["priority"]) => void;
}

const PriorityOptions = [
  { id: "high", label: "High", color: "#fb2c36" },
  { id: "medium", label: "Medium", color: "#2b7fff" },
  { id: "low", label: "Low", color: "#00c951" },
  { id: "none", label: "None", color: "#6a7282" },
] as const;

function PriorityPicker({
  open,
  setOpen,
  priority,
  onPriorityChange,
  className,
}: PriorityPickerProps) {
  const triggerColor =
    PriorityOptions.find((o) =>
      o.id === "none" ? priority == null : priority === o.id,
    )?.color ?? "#6a7282";

  return (
    <Popover
      openPopover={open}
      setOpenPopover={setOpen}
      sideOffset={0}
      content={
        <div className={cn("flex flex-col w-full md:w-[130px] ", className)}>
          {PriorityOptions.map((option) => {
            const isSelected =
              option.id === "none" ? priority == null : priority === option.id;
            return (
              <button
                key={option.id}
                className="flex items-center gap-3 hover:bg-muted hover:text-foreground py-1.5 px-3 cursor-pointer"
                onClick={() =>
                  onPriorityChange(option.id === "none" ? null : option.id)
                }
              >
                <Flag
                  color={option.color}
                  fill={option.id === "none" ? "none" : option.color}
                  size={20}
                />
                <span className="font-light">{option.label}</span>
                {isSelected && <Check strokeWidth={2} size={15} />}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="w-fit h-full border border-border rounded-sm p-1 flex gap-2 items-center hover:bg-muted/50 cursor-pointer">
        <Flag
          size={18}
          strokeWidth={1}
          color={triggerColor}
          fill={priority == null ? "none" : triggerColor}
        />
        {priority && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onPriorityChange(null);
            }}
          >
            <X
              strokeWidth={1}
              size={12}
              className="hover:bg-muted rounded-xs cursor-pointer"
              aria-label="Clear priority"
            />
          </button>
        )}
      </div>
    </Popover>
  );
}

export default PriorityPicker;
