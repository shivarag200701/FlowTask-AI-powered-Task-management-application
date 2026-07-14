import AssistantChat from "@/features/assistant/components/AssistantChat";
import AssistantSettings from "@/features/assistant/components/AssistantSettings";
import { useAssistantNav } from "@/features/assistant/context/AssistantNavContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

function Assistant() {
  const [showSettings, setShowSettings] = useState(false);
  const { activeConversationId, setActiveConversationId } = useAssistantNav();
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();

  // Sync URL param → context on mount / URL change
  useEffect(() => {
    const urlId = conversationId ?? null;
    if (urlId !== activeConversationId) {
      setActiveConversationId(urlId);
    }
  }, [conversationId]);

  // Sync context → URL when conversation changes (e.g. from sidebar or dropdown)
  useEffect(() => {
    const urlId = conversationId ?? null;
    if (activeConversationId !== urlId) {
      if (activeConversationId) {
        navigate(`/app/assistant/${activeConversationId}`, { replace: true });
      } else {
        navigate("/app/assistant", { replace: true });
      }
    }
  }, [activeConversationId]);

  return (
    <div className="flex flex-col h-dvh md:h-full">
      {/* Page header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-6 py-3.5">
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
