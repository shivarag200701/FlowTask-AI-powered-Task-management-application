import { cn } from "@/lib/utils";
import { AILogo } from "@/components/ui/ai-logo";
import { motion } from "motion/react";
import Markdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

function ChatMessage({ role, content, createdAt }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("flex flex-col", isUser ? "items-end" : "items-start")}
    >
      {/* Assistant label */}
      {!isUser && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <AILogo active className="size-4" />
          <span className="text-xs font-semibold text-foreground">Flow AI</span>
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "text-sm leading-relaxed",
          isUser
            ? "max-w-[80%] rounded-2xl rounded-br-sm bg-muted/70 px-4 py-2.5 text-foreground"
            : "max-w-[90%] pl-[26px] text-foreground/90"
        )}
      >
        <Markdown>{content}</Markdown>
      </div>

      {/* Timestamp */}
      {createdAt && (
        <span
          className={cn(
            "mt-1 text-[10px] text-muted-foreground/50 tabular-nums",
            isUser ? "pr-1" : "pl-[26px]"
          )}
        >
          {new Date(createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </motion.div>
  );
}

export default ChatMessage;
