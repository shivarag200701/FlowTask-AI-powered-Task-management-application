import { cn } from "@/lib/utils";
import { Recurrences } from "@/utils/constants/recurrence";
import type { CreateTodo } from "@shiva200701/todotypes";
import { Check } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

function RecurrenceDropDown({ onSelect }: { onSelect?: () => void }) {
  const { control, setValue } = useFormContext<CreateTodo>();

  const [selectedRecurrenceRule, _recurrenceEndDate] = useWatch({
    control,
    name: ["recurrenceRule", "recurrenceEndDate"],
  });

  console.log("selected recurrence rule", selectedRecurrenceRule);

  return (
    <div className="flex flex-col gap-1 p-2 text-[13px] w-full sm:w-[250px]">
      {Recurrences.map((recurrence) => (
        <button
          key={recurrence.value}
          className={cn(
            "flex items-center justify-start gap-4  px-3 py-2 hover:bg-accent hover:cursor-pointer rounded-md tranistion-all duration-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setValue(
              "recurrenceRule",
              { pattern: recurrence.value, interval: 1 },
              { shouldDirty: true }
            );
            onSelect?.();
          }}
        >
          <div className="flex gap-2 justify-between w-full">
            <div className="flex gap-2">
              <p className="font-semibold">{recurrence.label}</p>
            </div>
            {selectedRecurrenceRule?.pattern === recurrence.value && (
              <Check className="size-6 sm:size-4" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

export default RecurrenceDropDown;
