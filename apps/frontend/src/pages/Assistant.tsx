import AssistantChat from "@/features/assistant/components/AssistantChat";
import AssistantSettings from "@/features/assistant/components/AssistantSettings";
import { useAssistantNav } from "@/features/assistant/context/AssistantNavContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Settings, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function Assistant() {
  const [showSettings, setShowSettings] = useState(false);
  const { activeConversationId, setActiveConversationId } = useAssistantNav();

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3.5">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "flex size-8 items-center justify-center rounded-md transition-colors",
            showSettings
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {showSettings ? (
            <X className="size-4" />
          ) : (
            <Settings className="size-4" />
          )}
        </button>
      </div>

      {showSettings ? (
        <div className="flex-1 overflow-y-auto p-6 max-w-xl">
          <AssistantSettings />
        </div>
      ) : (
        <AssistantChat
          className="flex-1 min-h-0"
          activeConversationId={activeConversationId}
          onConversationChange={setActiveConversationId}
        />
      )}
    </div>
  );
}

export default Assistant;
