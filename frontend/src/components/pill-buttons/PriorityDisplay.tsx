import type { TodoWithCompleteAtDateTime } from "@/types";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { outlinePopoverTriggerClasses } from "@/lib/constants";

function PriorityDisplayer({
  ref,
  priority,
  ...props
}: {
  priority: TodoWithCompleteAtDateTime["priority"];
} & ComponentProps<typeof Button>) {
  return (
    <Button
      ref={ref}
      {...props}
      variant="outline"
      className={cn(
        "w-full md:w-fit text-sm h-10",
        outlinePopoverTriggerClasses,
      )}
      icon={<Flag />}
      type="button"
    >
      {priority ? priority : "Priority"}
    </Button>
  );
}

export default PriorityDisplayer;
