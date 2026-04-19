import { AlarmClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TodoWithCompleteAtDateTime } from "@/types";

function ReminderDisplayer({
  reminder,
}: {
  remimder: TodoWithCompleteAtDateTime["reminder"];
}) {
  return (
    <Button
      variant="outline"
      className="w-fit text-xs"
      icon={<AlarmClock />}
      size="sm"
      type="button"
    >
      reminder
    </Button>
  );
}

export default ReminderDisplayer;
