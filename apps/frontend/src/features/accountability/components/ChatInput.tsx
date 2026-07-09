import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

function ChatInput({ onSend, disabled, isLoading, placeholder = "Type a message..." }: ChatInputProps) {
  const [input, setInput] = useState("");

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

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t bg-white px-4 py-3">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
        autoFocus
      />
      <button
        type="submit"
        disabled={!input.trim() || disabled || isLoading}
        className={cn(
          "flex size-8 items-center justify-center rounded-full transition-colors",
          input.trim() && !disabled && !isLoading
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
      </button>
    </form>
  );
}

export default ChatInput;
