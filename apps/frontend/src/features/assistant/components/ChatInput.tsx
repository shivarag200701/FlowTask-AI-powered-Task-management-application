import { useState, useRef, useEffect, type ReactNode } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: ReactNode | string;
}

function ChatInput({
  onSend,
  disabled,
  isLoading,
  placeholder = "Tell AI what to do next",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || disabled || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  return (
    <div className="px-4 pb-4 pt-2">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex flex-col gap-2 rounded-xl border border-border bg-background",
          "shadow-sm transition-shadow focus-within:shadow-md focus-within:border-border/80"
        )}
      >
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent px-4 pt-3 pb-1 text-sm",
              "focus:outline-none placeholder:text-muted-foreground/50",
              "disabled:opacity-50"
            )}
            autoFocus
          />
          {!input && (
            <div className="pointer-events-none absolute left-4 top-2  right-4">
              {typeof placeholder === "string" ? (
                <span className="text-sm text-muted-foreground/50">
                  {placeholder}
                </span>
              ) : (
                placeholder
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end px-3 pb-2.5">
          <button
            type="submit"
            disabled={!input.trim() || disabled || isLoading}
            className={cn(
              "flex size-7 items-center justify-center rounded-lg transition-all",
              input.trim() && !disabled && !isLoading
                ? "bg-primary text-primary-foreground hover:bg-primary/90 scale-100"
                : "bg-muted text-muted-foreground scale-95 opacity-60"
            )}
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatInput;
