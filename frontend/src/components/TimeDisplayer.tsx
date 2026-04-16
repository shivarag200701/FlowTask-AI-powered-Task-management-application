import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { DateTime } from "luxon";

function TimeDisplayer({
  className,
  dueTime,
}: {
  className?: string;
  dueTime: DateTime;
}) {
  const today = DateTime.now();

  const sameDay = today.hasSame(dueTime, "day");

  const time = dueTime.toFormat("h:mm a");
  return (
    <div
      className={cn("flex gap-2 items-center", className, {
        "text-green-500": sameDay,
      })}
    >
      <Calendar size={13} />
      {time}
    </div>
  );
}

export default TimeDisplayer;
