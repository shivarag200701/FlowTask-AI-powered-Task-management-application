import { AlarmClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { cn } from "@/lib/utils";
import { outlinePopoverTriggerClasses } from "@/lib/constants";
import type { ComponentProps } from "react";
import { useTaskDisplayContext } from "@/context/TaskDisplayContext";

function ReminderDisplayer({
  ref,
  ...props
}: {
  remimder: TodoWithCompleteAtDateTime["reminder"];
} & ComponentProps<typeof Button>) {
  const { viewMode } = useTaskDisplayContext();
  return (
    <Button
      ref={ref}
      {...props}
      variant="outline"
      className={cn(
        "w-full md:w-fit text-sm h-8",
        outlinePopoverTriggerClasses
      )}
      icon={<AlarmClock />}
      type="button"
    >
      {viewMode !== "board" ? "reminder" : ""}
    </Button>
  );
}

export default ReminderDisplayer;
