import { AlarmClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { cn } from "@/lib/utils";
import { outlinePopoverTriggerClasses } from "@/lib/constants";
import type { ComponentProps } from "react";

function ReminderDisplayer({
  ref,
  reminder,
  ...props
}: {
  remimder: TodoWithCompleteAtDateTime["reminder"];
} & ComponentProps<typeof Button>) {
  return (
    <Button
      ref={ref}
      {...props}
      variant="outline"
      className={cn("w-fit text-sm", outlinePopoverTriggerClasses)}
      icon={<AlarmClock />}
      type="button"
    >
      reminder
    </Button>
  );
}

export default ReminderDisplayer;
