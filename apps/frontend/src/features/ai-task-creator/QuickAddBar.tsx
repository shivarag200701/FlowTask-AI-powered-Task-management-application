import { useState } from "react";
import { Sparkles, ArrowRight, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParseTask } from "@/hooks/use-ai";
import type { ParsedTask } from "@shiva200701/todotypes";

// ── Mock parsed result (replace with real API call later) ──────────────
// const MOCK_DELAY = 1500;

// function mockParseTask(input: string): Promise<ParsedTask> {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         title: input
//           .replace(/#\w+/g, "")
//           .replace(/by\s+\w+/gi, "")
//           .trim(),
//         dueDate: "2026-06-19",
//         dueTime: "17:00",
//         priority: input.toLowerCase().includes("high")
//           ? "high"
//           : input.toLowerCase().includes("low")
//             ? "low"
//             : "medium",
//         tags: (input.match(/#(\w+)/g) || []).map((t) => t.slice(1)),
//         isAllDay: false,
//       });
//     }, MOCK_DELAY);
//   });
// }

// ── Priority badge colors ──────────────────────────────────────────────
const priorityStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

// ── Component ──────────────────────────────────────────────────────────
function QuickAddBar() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedTask | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { mutateAsync, isPending } = useParseTask();

  const handleSubmit = async () => {
    console.log("called", input);
    if (!input.trim()) return;

    const result = await mutateAsync({ input });
    setParsed(result);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (parsed) {
        handleConfirm();
      } else {
        handleSubmit();
      }
    }
    if (e.key === "Escape") {
      handleDismiss();
    }
  };

  const handleConfirm = () => {
    // In real implementation: call createTodo() with parsed data
    console.log("Would create task:", parsed);
    handleDismiss();
  };

  const handleDismiss = () => {
    setInput("");
    setParsed(null);
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-all duration-200",
          isFocused
            ? "border-primary/40 ring-4 ring-primary/10 shadow-sm"
            : "border-border hover:border-border/80",
          parsed && "rounded-b-none border-b-0"
        )}
      >
        <Sparkles
          className={cn(
            "size-4 shrink-0 transition-colors",
            isFocused || isPending ? "text-primary" : "text-muted-foreground"
          )}
        />
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (parsed) setParsed(null);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder='Try: "Submit tax forms by Friday 5pm, high priority #finance"'
          className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/60"
          disabled={isPending}
        />
        {input && !isPending && !parsed && (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Parse
            <ArrowRight className="size-3" />
          </button>
        )}
        {isPending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin text-primary" />
            <span>Parsing...</span>
          </div>
        )}
        {input && !isPending && (
          <button
            onClick={handleDismiss}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {parsed && (
        <div className="rounded-b-xl border border-t-0 border-border bg-neutral-50 px-4 py-3 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">
                {parsed.title}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {parsed.dueDate && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    📅 {parsed.dueDate}
                    {parsed.dueTime && ` at ${parsed.dueTime}`}
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
                    key={tag.id}
                    className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Press{" "}
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              to confirm
              {" · "}
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                Esc
              </kbd>{" "}
              to dismiss
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickAddBar;
