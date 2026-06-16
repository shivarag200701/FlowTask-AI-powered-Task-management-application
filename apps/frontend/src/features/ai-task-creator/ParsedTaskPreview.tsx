import { cn } from "@/lib/utils";
import { priorityStyles } from "@/utils/constants/priority";
import type { ParsedTask } from "@shiva200701/todotypes";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";

interface ParsedTaskPreviewProps {
  parsed: ParsedTask;
  onConfirm: () => void;
  onRetype: () => void;
  isCreating?: boolean;
}

function ParsedTaskPreview({
  parsed,
  onConfirm,
  onRetype,
  isCreating,
}: ParsedTaskPreviewProps) {
  return (
    <div className="rounded-xl border border-border bg-neutral-50 p-3 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">{parsed.title}</p>
        <div className="flex flex-wrap items-center gap-2">
          {parsed.dueDate && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {parsed.dueDate}
              {parsed.dueTime &&
                ` at ${DateTime.fromISO(parsed.dueTime).toFormat("h:mm a")}`}
            </span>
          )}
          {parsed.priority && (
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                priorityStyles[parsed.priority]
              )}
            >
              {parsed.priority}
            </span>
          )}
          {parsed.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1 border-t border-border/50">
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetype}
          disabled={isCreating}
          Initial="Re-type"
        />
        <Button
          variant="default"
          size="sm"
          onClick={onConfirm}
          isSubmitting={isCreating}
          Initial="Create Task"
          Loading="Creating..."
        />
      </div>
    </div>
  );
}

export default ParsedTaskPreview;
