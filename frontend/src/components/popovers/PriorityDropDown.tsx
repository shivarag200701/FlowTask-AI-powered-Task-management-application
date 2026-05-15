import { cn } from "@/lib/utils";
import { priorities } from "@/utils/constants/priority";
import type { CreateTodo } from "@shiva200701/todotypes";
import { Check, Flag } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

function PriorityDropDown({ onSelect }: { onSelect?: () => void }) {
  const { control, setValue } = useFormContext<CreateTodo>();
  const [selectedPriority] = useWatch({
    control,
    name: ["priority"],
  });

  return (
    <div className="flex flex-col gap-1 p-2 text-[13px] w-full sm:w-[160px]">
      {priorities.map((priority) => (
        <button
          key={priority.id}
          className={cn(
            "flex items-center justify-start gap-4  px-3 py-2 hover:bg-accent hover:cursor-pointer rounded-md tranistion-all duration-100"
          )}
          onClick={() => {
            setValue("priority", priority.id, { shouldDirty: true });
            onSelect?.();
          }}
        >
          <div className="flex gap-2 justify-between w-full">
            <div className="flex gap-2">
              <Flag
                className={`size-4 ${priority.textClass}`}
                fill={priority.fillColor}
              />
              <p className="font-semibold">{priority.label}</p>
            </div>
            {selectedPriority === priority.id && (
              <Check className="size-6 sm:size-4" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

export default PriorityDropDown;
