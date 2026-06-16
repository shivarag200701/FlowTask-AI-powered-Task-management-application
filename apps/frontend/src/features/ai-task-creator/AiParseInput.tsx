import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParsedTask } from "@shiva200701/todotypes/src/v2/ai.js";

interface AiParseInputProps {
  input: string;
  setInput: (value: string) => void;
  isPending: boolean;
  parsed: ParsedTask | null;
  onParse: () => void;
  onConfirm: () => void;
  onDismiss: () => void;
  onClearParsed: () => void;
  className?: string;
}

function AiParseInput({
  input,
  setInput,
  isPending,
  parsed,
  onParse,
  onConfirm,
  onDismiss,
  onClearParsed,
  className,
}: AiParseInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (parsed) {
        onConfirm();
      } else {
        onParse();
      }
    }
    if (e.key === "Escape") {
      if (parsed) {
        onClearParsed();
      } else {
        onDismiss();
      }
    }
  };

  return (
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
          if (parsed) onClearParsed();
        }}
        onKeyDown={handleKeyDown}
        placeholder='e.g. "Submit tax forms by Friday 5pm #finance"'
        className={cn(
          "flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/60",
          className
        )}
        disabled={isPending}
        autoFocus
      />
      {isPending ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
      ) : (
        input &&
        !parsed && (
          <button
            onClick={onParse}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Parse <ArrowRight className="size-3" />
          </button>
        )
      )}
    </div>
  );
}

export default AiParseInput;
