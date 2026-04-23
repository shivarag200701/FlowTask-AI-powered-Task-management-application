import { cn } from "@/utils/functions/cn";
import { Calendar } from "lucide-react";
import { DateTime } from "luxon";

function TodayCalendarIcon({ className }: { className?: string }) {
  const today = DateTime.now().toFormat("dd");
  return (
    <Calendar className={cn(className)} strokeWidth={1.5}>
      <text
        x="12.5"
        y="19"
        fontSize="10"
        textAnchor="middle"
        strokeWidth={0.5}
        fill="currentColor"
      >
        {today}
      </text>
    </Calendar>
  );
}

export default TodayCalendarIcon;
