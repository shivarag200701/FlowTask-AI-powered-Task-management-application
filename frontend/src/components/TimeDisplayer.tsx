import { cn } from "@/lib/utils";
import type { TodoWithCompleteAtDateTime } from "@/types";
import type { DateTime } from "luxon";

function TimeDisplayer({
  className,
  dueTime,
}: {
  className?: string;
  dueTime: DateTime;
}) {
  const time = dueTime.toFormat("h:mm a");
  return <div className={cn("", className)}>{time}</div>;
}

export default TimeDisplayer;
