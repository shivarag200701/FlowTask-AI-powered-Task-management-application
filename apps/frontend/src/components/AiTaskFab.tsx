import { useState } from "react";
import { Sparkles, ArrowRight, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "./ui/modal";

// ── Mock parsed result (replace with real API call later) ──────────────
const MOCK_DELAY = 1500;

interface ParsedTask {
  title: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: "high" | "medium" | "low" | null;
  tags: string[];
  isAllDay: boolean;
}

function mockParseTask(input: string): Promise<ParsedTask> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: input.replace(/#\w+/g, "").replace(/by\s+\w+/gi, "").trim(),
        dueDate: "2026-06-19",
        dueTime: "17:00",
        priority: input.toLowerCase().includes("high")
          ? "high"
          : input.toLowerCase().includes("low")
            ? "low"
            : "medium",
        tags: (input.match(/#(\w+)/g) || []).map((t) => t.slice(1)),
        isAllDay: false,
      });
    }, MOCK_DELAY);
  });
}

const priorityStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

function AiTaskFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedTask | null>(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    const result = await mockParseTask(input);
    setParsed(result);
    setIsLoading(false);
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
      if (parsed) {
        setParsed(null);
      } else {
        handleDismiss();
      }
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
    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      {/* ── FAB button ──────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-20",
          "flex items-center justify-center",
          "size-12 rounded-full",
          "bg-primary text-primary-foreground shadow-lg",
          "hover:bg-primary/90 hover:shadow-xl hover:scale-105",
          "active:scale-95",
          "transition-all duration-200",
          // nudge up when TaskToolBar is visible (it sits at bottom-4)
          "md:bottom-8 md:right-8"
        )}
      >
        <Sparkles className="size-5" />
      </button>

      {/* ── Modal / Bottom sheet ────────────────────────────────── */}
      <Modal
        showModal={isOpen}
        setShowModal={setIsOpen}
        onClose={handleDismiss}
        className="max-w-lg"
      >
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">AI Task Creator</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Input */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200",
              "focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10"
            )}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (parsed) setParsed(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder='e.g. "Submit tax forms by Friday 5pm #finance"'
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/60"
              disabled={isLoading}
              autoFocus
            />
            {isLoading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
            ) : (
              input &&
              !parsed && (
                <button
                  onClick={handleSubmit}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Parse <ArrowRight className="size-3" />
                </button>
              )
            )}
          </div>

          {/* Parsed preview */}
          {parsed && (
            <div className="rounded-xl border border-border bg-neutral-50 p-3 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  {parsed.title}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {parsed.dueDate && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {parsed.dueDate}
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
                      key={tag}
                      className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-border/50">
                <button
                  onClick={() => setParsed(null)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Re-type
                </button>
                <button
                  onClick={handleConfirm}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Create Task
                </button>
              </div>
            </div>
          )}

          {/* Hint text */}
          {!parsed && !isLoading && (
            <p className="text-xs text-muted-foreground/70 text-center">
              Describe your task naturally — AI will extract the title, date,
              priority, and tags.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}

export default AiTaskFab;
