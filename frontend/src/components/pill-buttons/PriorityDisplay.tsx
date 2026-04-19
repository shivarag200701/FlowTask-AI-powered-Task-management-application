import type { TodoWithCompleteAtDateTime } from "@/types";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

function PriorityDisplayer({
  priority,
}: {
  priority: TodoWithCompleteAtDateTime["priority"];
}) {
  return (
    <Button
      variant="outline"
      className="w-fit text-xs"
      icon={<Flag />}
      size="sm"
      type="button"
    >
      {priority ? priority : "Priority"}
    </Button>
  );
}

export default PriorityDisplayer;
