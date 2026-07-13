import { useAssistantConversations } from "../hooks/use-assistant";
import { useAssistantNav } from "../context/AssistantNavContext";
import { SquarePen, MessageSquareText, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { AILogo } from "@/components/ui/ai-logo";
import { useMemo, useState } from "react";
import { Popover } from "@/components/ui/popover";

function ConversationList() {
  const { activeConversationId, setActiveConversationId } = useAssistantNav();
  const { data: conversations, isLoading } = useAssistantConversations();

  const [isMoreConversationsOpen, setIsMoreConversationsOpen] = useState(false);

  const hasMoreConversations = useMemo(() => {
    if (conversations) return conversations?.length > 5;
    else false;
  }, [conversations]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <h2 className="text-md font-semibold  uppercase tracking-wider">AI</h2>
        <button
          onClick={() => setActiveConversationId(null)}
          className="flex size-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-neutral-200 hover:text-sidebar-foreground"
          title="New conversation"
        >
          <SquarePen className="size-3.5" />
        </button>
      </div>
      <div className="px-3">
        <button
          onClick={() => setActiveConversationId(null)}
          className="flex items-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-neutral-200 hover:text-sidebar-foreground gap-2 p-2 w-full text-left cursor-pointer"
          title="New conversation"
        >
          <AILogo active={true} />
          <span className="text-xs">Ask or Create</span>
        </button>
      </div>
      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {isLoading ? (
          <div className="px-2 py-4 text-xs text-sidebar-foreground/50 text-center">
            Loading...
          </div>
        ) : !conversations?.length ? (
          <div className="flex flex-col items-center gap-2 px-2 py-8 text-center">
            <MessageSquareText className="size-5 text-sidebar-foreground/30" />
            <p className="text-xs text-sidebar-foreground/50">
              No conversations yet
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            <span className="text-xs text-neutral-400">Recent chats</span>
            {conversations.slice(0, 5).map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors cursor-pointer",
                  activeConversationId === conv.id
                    ? "bg-neutral-200 text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:bg-neutral-200/60 hover:text-sidebar-foreground"
                )}
              >
                <MessageSquareText className="size-3.5 shrink-0" />

                <p className="flex-1 min-w-0 truncate leading-snug">
                  {conv.title || "New conversation"}
                </p>
              </button>
            ))}
            {hasMoreConversations && (
              <MoreConversationsPopover
                conversations={conversations.slice(5)}
                activeConversationId={activeConversationId}
                onSelect={(id) => setActiveConversationId(id)}
                open={isMoreConversationsOpen}
                onOpenChange={setIsMoreConversationsOpen}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MoreConversationsPopover({
  conversations,
  activeConversationId,
  onSelect,
  open,
  onOpenChange,
}: {
  conversations: { id: string; title: string | null }[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Popover
      openPopover={open}
      setOpenPopover={onOpenChange}
      content={
        <div className="w-64 max-h-72 overflow-y-auto p-1.5 custom-scrollbar">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                onSelect(conv.id);
                onOpenChange(false);
              }}
              className={cn(
                "group flex w-full items-center gap-2 px-2.5 py-2 rounded-md text-left text-[13px] transition-colors cursor-pointer",
                activeConversationId === conv.id
                  ? "bg-neutral-200 text-foreground"
                  : "text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
              )}
            >
              <MessageSquareText className="size-3.5 shrink-0" />
              <p className="flex-1 min-w-0 truncate leading-snug">
                {conv.title || "New conversation"}
              </p>
            </button>
          ))}
        </div>
      }
      side="right"
      align="start"
    >
      <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1 text-left text-[13px] transition-colors text-sidebar-foreground/70 hover:bg-neutral-200/60 hover:text-sidebar-foreground cursor-pointer data-[state=open]:bg-neutral-200/60">
        <MoreHorizontal size={18} />
        <span>More</span>
      </button>
    </Popover>
  );
}

export default ConversationList;
