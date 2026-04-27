import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { outlinePopoverTriggerClasses } from "@/lib/constants";
import { useFormContext, useWatch } from "react-hook-form";
import type { CreateTodo } from "@shiva200701/todotypes";
import { priorities } from "@/utils/constants/priority";

function PriorityDisplayer({ ref, ...props }: ComponentProps<typeof Button>) {
  const { control } = useFormContext<CreateTodo>();

  const [selectedPriority] = useWatch({
    control,
    name: ["priority"],
  });

  const selectedPriorityData = priorities.find(
    (p) => p.id === selectedPriority,
  );
  return (
    <Button
      ref={ref}
      {...props}
      variant="outline"
      className={cn(
        "w-full md:w-fit text-sm h-10",
        outlinePopoverTriggerClasses,
      )}
      icon={
        <Flag
          className={selectedPriorityData?.textClass}
          fill={selectedPriorityData?.fillColor}
        />
      }
      type="button"
    >
      {selectedPriority ? selectedPriority : "Priority"}
    </Button>
  );
}

export default PriorityDisplayer;
