import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  MessageSquare,
  Brain,
  Wrench,
  Sparkles,
  ListChecks,
  CalendarCheck,
  ChevronDown,
} from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import {
  useStartConversation,
  useAssistantConversation,
  useStreamMessage,
  type StreamStage,
} from "../hooks/use-assistant";
import type {
  AiConversationResponse,
  AiMessageResponse,
} from "@shiva200701/todotypes";
import { ShimmeringText } from "@/components/animate-ui/primitives/texts/shimmering";
import { motion, AnimatePresence } from "motion/react";
import { AuroraText } from "@/components/ui/aurora-text";
import { Gradient } from "@/components/ui/gradient";
import { AILogo } from "@/components/ui/ai-logo";
import {
  RotatingText,
  RotatingTextContainer,
} from "@/components/animate-ui/primitives/texts/rotating";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import {
  useAssistantConversations,
  useSearchConversations,
} from "../hooks/use-assistant";
import { useAssistantNav } from "../context/AssistantNavContext";
import { MessageSquareText } from "lucide-react";
import ComboBox, {
  type ComboBoxGroup,
  type ComboBoxOptions,
} from "@/components/ComboBox";
import { useMemo } from "react";
import { DateTime } from "luxon";

const STAGE_CONFIG: Record<
  Exclude<StreamStage, "idle" | "streaming" | "complete" | "tool_calling">,
  { labels: string[]; icon: typeof Loader2 }
> = {
  received: {
    labels: ["Understanding your message..."],
    icon: MessageSquare,
  },
  thinking: {
    labels: ["Thinking...", "Looking things up...", "Preparing response..."],
    icon: Brain,
  },
};

const TOOL_LABELS: Record<string, string> = {
  complete_task: "Marking task as complete...",
  reschedule_task: "Rescheduling task...",
  create_task: "Creating a new task...",
  get_tasks_for_date: "Looking up your tasks...",
  search_tasks: "Searching your tasks...",
  update_task_priority: "Updating task priority...",
  list_projects: "Fetching your projects...",
};

const QUICK_ACTIONS = [
  {
    icon: ListChecks,
    label: "Today's Tasks",
    prompt: "What are my tasks for today?",
  },
  {
    icon: Sparkles,
    label: "Plan My Day",
    prompt: "Help me plan my day",
  },
  {
    icon: CalendarCheck,
    label: "Check Progress",
    prompt: "How am I doing on my tasks this week?",
  },
];

interface AssistantChatProps {
  className?: string;
  activeConversationId: string | null;
  onConversationChange: (id: string | null) => void;
}

function AssistantChat({
  className,
  activeConversationId,
  onConversationChange,
}: AssistantChatProps) {
  const [localMessages, setLocalMessages] = useState<AiMessageResponse[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversationData } =
    useAssistantConversation(activeConversationId);
  const startConversation = useStartConversation();

  const handleStreamComplete = useCallback((message: AiMessageResponse) => {
    setLocalMessages((prev) => [...prev, message]);
  }, []);

  const {
    send,
    abort,
    isStreaming,
    streamingContent,
    streamStage,
    activeToolCall,
  } = useStreamMessage(activeConversationId || "", handleStreamComplete);

  // Sync messages from conversation data
  useEffect(() => {
    if (conversationData?.messages) {
      setLocalMessages(conversationData.messages);
    }
  }, [conversationData]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, streamingContent]);

  // Cleanup on unmount
  useEffect(() => () => abort(), [abort]);

  const handleSend = async (content: string) => {
    // Auto-start a conversation if none exists
    if (!activeConversationId) {
      const conversation = await startConversation.mutateAsync();
      onConversationChange(conversation.id);
      setLocalMessages([]);

      // Optimistically add user message
      const tempUserMsg: AiMessageResponse = {
        id: crypto.randomUUID(),
        conversationId: conversation.id,
        role: "user",
        content,
        metadata: null,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, tempUserMsg]);

      await send(content, conversation.id);
      return;
    }

    // Optimistically add user message
    const tempUserMsg: AiMessageResponse = {
      id: crypto.randomUUID(),
      conversationId: activeConversationId,
      role: "user",
      content,
      metadata: null,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, tempUserMsg]);

    await send(content);
  };

  const hasMessages = activeConversationId && localMessages.length > 0;

  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      {hasMessages && (
        <div className="shrink-0 px-6 py-2">
          <ConversationsDropDown conversation={conversationData} />
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto relative custom-scrollbar">
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            /* Empty state */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full px-6"
            >
              <Gradient className="opacity-25 w-[200px] absolute top-0 aspect" />

              <div className="flex flex-col items-center gap-5 -mt-12 max-w-md w-full">
                <AILogo animated />

                {/* Title */}
                <div className="text-center space-y-1.5">
                  <AuroraText className="text-xl font-semibold text-foreground tracking-tight">
                    AI Assistant
                  </AuroraText>
                  <RotatingTextContainer
                    duration={3000}
                    className="text-sm text-muted-foreground leading-relaxed"
                    text={[
                      "Ask anything about your tasks",
                      "plan your day",
                      "get help staying productive",
                    ]}
                  >
                    <RotatingText />
                  </RotatingTextContainer>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-3 gap-2 w-full mt-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleSend(action.prompt)}
                      disabled={startConversation.isPending || isStreaming}
                      className="flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-background p-3 text-left transition-colors hover:bg-muted/50 hover:border-border disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <action.icon className="size-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground leading-tight">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Messages */
            <PageWidthWrapper className="max-w-3xl">
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 space-y-5 "
              >
                {localMessages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    role={msg.role as "user" | "assistant"}
                    content={msg.content}
                    createdAt={msg.createdAt}
                    toolResults={msg.metadata?.toolCalls}
                  />
                ))}

                {/* Stage indicator */}
                {isStreaming &&
                  !streamingContent &&
                  (streamStage === "received" ||
                    streamStage === "thinking") && (
                    <StreamingStageIndicator stage={streamStage} />
                  )}

                {/* Tool call indicator */}
                {isStreaming &&
                  streamStage === "tool_calling" &&
                  activeToolCall && (
                    <div className="flex items-center gap-2 pl-[26px]">
                      <Wrench className="size-3.5 text-muted-foreground animate-pulse" />
                      <ShimmeringText
                        text={
                          TOOL_LABELS[activeToolCall] || "Running action..."
                        }
                        duration={0.3}
                        className="text-sm"
                        color="var(--color-muted-foreground)"
                        shimmeringColor="var(--color-border)"
                      />
                    </div>
                  )}

                {/* Streaming bubble */}
                {isStreaming && streamingContent && (
                  <ChatMessage role="assistant" content={streamingContent} />
                )}

                <div ref={messagesEndRef} />
              </motion.div>
            </PageWidthWrapper>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <PageWidthWrapper className="max-w-3xl">
        <ChatInput
          onSend={handleSend}
          isLoading={isStreaming}
          placeholder={
            !hasMessages ? (
              <RotatingTextContainer
                duration={3000}
                className="text-sm text-neutral-400 leading-relaxed"
                text={[
                  "Move all my overdue tasks to today",
                  "What did I actually finish this week?",
                  "Create a task for Friday's deadline",
                  "Which project am I falling behind on?",
                  "Mark my morning tasks as done",
                  "Reprioritize everything due tomorrow",
                ]}
              >
                <RotatingText />
              </RotatingTextContainer>
            ) : (
              <span className="text-sm text-neutral-400">
                Tell AI what to do next
              </span>
            )
          }
        />
      </PageWidthWrapper>
    </div>
  );
}

function ConversationsDropDown({
  conversation,
}: {
  conversation?: AiConversationResponse;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { setActiveConversationId } = useAssistantNav();
  const { data: conversations } = useAssistantConversations();
  const { data: searchResults, isFetching: isSearching } =
    useSearchConversations(search);

  const isSearchMode = search.trim().length > 0;
  const displayList = isSearchMode ? searchResults : conversations;

  const groups = useMemo((): ComboBoxGroup[] => {
    if (!displayList?.length) return [];
    const now = DateTime.now();

    const result: ComboBoxGroup[] = [];
    const map = new Map<string, ComboBoxOptions[]>();

    for (const conv of displayList) {
      const dt = DateTime.fromISO(conv.updatedAt);
      let label: string;
      if (dt.hasSame(now, "day")) label = "Today";
      else if (dt.hasSame(now.minus({ days: 1 }), "day")) label = "Yesterday";
      else label = dt.toFormat("MMM d");

      const time = dt.toFormat("h:mm a");

      const option: ComboBoxOptions = {
        value: conv.id,
        label: conv.title || "New conversation",
        icon: <MessageSquareText className="size-4" strokeWidth={1.5} />,
        detail: time,
      };

      if (!map.has(label)) {
        const items: ComboBoxOptions[] = [];
        map.set(label, items);
        result.push({ label, items });
      }
      map.get(label)!.push(option);
    }
    return result;
  }, [displayList]);

  const selectedOption: ComboBoxOptions | null = conversation
    ? {
        value: conversation.id,
        label: conversation.title || "New conversation",
        icon: <MessageSquareText className="size-4" />,
      }
    : null;

  return (
    <ComboBox
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSearch("");
      }}
      groups={groups}
      selectedOption={selectedOption}
      onSelect={(option) => {
        setActiveConversationId(option.value);
        setOpen(false);
        setSearch("");
      }}
      searchValue={search}
      setSearchValue={setSearch}
      shouldFilter={!isSearchMode}
      loading={isSearchMode && isSearching}
      trigger
      triggerClassName="w-fit py-1.5"
      inputBoxText="Search conversations..."
      icon={null}
      popoverAlign="start"
      contentClassName="w-[320px]"
    >
      {conversation?.title || "New conversation"}
      <ChevronDown strokeWidth={1} />
    </ComboBox>
  );
}

function StreamingStageIndicator({
  stage,
}: {
  stage: "received" | "thinking";
}) {
  const config = STAGE_CONFIG[stage];
  const [labelIndex, setLabelIndex] = useState(0);

  useEffect(() => {
    setLabelIndex(0);
  }, [stage]);

  useEffect(() => {
    if (config.labels.length <= 1) return;
    const interval = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % config.labels.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [config.labels.length]);

  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2 pl-[26px]">
      <Icon className="size-3.5 text-muted-foreground animate-pulse" />
      <ShimmeringText
        text={config.labels[labelIndex]}
        duration={0.3}
        className="text-sm"
        color="var(--color-muted-foreground)"
        shimmeringColor="var(--color-border)"
      />
    </div>
  );
}

export default AssistantChat;
