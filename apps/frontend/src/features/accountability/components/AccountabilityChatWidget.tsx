import { useState } from "react";
import { Bot, X } from "lucide-react";
import { cn } from "@/lib/utils";
import AccountabilityChat from "./AccountabilityChat";
import { useAccountabilityStats } from "../hooks/use-accountability";

function AccountabilityChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: stats } = useAccountabilityStats();

  const hasUnread = (stats?.unreadInsights ?? 0) > 0;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-20 right-6 z-30",
            "flex items-center justify-center",
            "size-11 rounded-full",
            "bg-foreground text-background shadow-lg",
            "hover:scale-105 active:scale-95",
            "transition-all duration-200",
            "md:bottom-8 md:right-20"
          )}
        >
          <Bot className="size-5" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 size-3 rounded-full bg-primary border-2 border-background" />
          )}
        </button>
      )}

      {/* Slide-over panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className={cn(
              "fixed right-0 top-0 z-50 h-full w-full sm:w-[420px]",
              "bg-white border-l shadow-2xl",
              "animate-in slide-in-from-right duration-300"
            )}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Accountability Partner</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Chat */}
            <div className="h-[calc(100%-49px)]">
              <AccountabilityChat />
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default AccountabilityChatWidget;
