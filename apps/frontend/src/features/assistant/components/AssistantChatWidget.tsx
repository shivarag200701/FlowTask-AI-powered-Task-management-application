import { useState } from "react";
import { Bot, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import AssistantChat from "./AssistantChat";

function AssistantChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "fixed bottom-20 right-6 z-30",
              "flex items-center justify-center",
              "size-12 rounded-full",
              "bg-primary text-primary-foreground shadow-lg",
              "hover:shadow-xl hover:scale-105 active:scale-95",
              "transition-all duration-200",
              "md:bottom-8 md:right-20"
            )}
          >
            <Bot className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Slide-over panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className={cn(
                "fixed right-0 top-0 z-50 h-full w-full sm:w-[420px]",
                "bg-background border-l border-border shadow-2xl",
                "flex flex-col"
              )}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
                    <Bot className="size-3.5 text-primary" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Chat */}
              <div className="flex-1 min-h-0">
                <AssistantChat
                  className="h-full"
                  activeConversationId={activeConversationId}
                  onConversationChange={setActiveConversationId}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default AssistantChatWidget;
