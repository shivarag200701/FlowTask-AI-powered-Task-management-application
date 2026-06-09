import { Button } from "../ui/button";
import type { ComponentProps } from "react";
import { outlinePopoverTriggerClasses } from "@/lib/constants";
import { CalendarClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function DateTimeDisplayer({ ref, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      ref={ref}
      {...props}
      variant="outline"
      className={cn(
        "w-full md:w-fit text-sm h-10",
        outlinePopoverTriggerClasses
      )}
      icon={<CalendarClockIcon />}
      type="button"
    >
      Date
    </Button>
  );
}

export default DateTimeDisplayer;
