import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, Brain, Wrench } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Button } from "@/components/ui/button";
import {
  useStartSession,
  useCompleteSession,
  useAccountabilitySessions,
  useAccountabilitySession,
  useStreamMessage,
  type StreamStage,
} from "../hooks/use-accountability";
import type { AccountabilityMessageResponse } from "@shiva200701/todotypes";
import { ShimmeringText } from "@/components/animate-ui/primitives/texts/shimmering";

const STAGE_CONFIG: Record<
  Exclude<StreamStage, "idle" | "streaming" | "complete" | "tool_calling">,
  { labels: string[]; icon: typeof Loader2 }
> = {
  received: {
    labels: ["Understanding your message..."],
    icon: MessageSquare,
  },
  thinking: {
    labels: [
      "Thinking...",
      "Looking things up...",
      "Preparing response...",
    ],
    icon: Brain,
  },
};

const TOOL_LABELS: Record<string, string> = {
  complete_task: "Marking task as complete...",
  reschedule_task: "Rescheduling task...",
  create_task: "Creating a new task...",
  get_tasks_for_date: "Looking up your tasks...",
};

interface AccountabilityChatProps {
  className?: string;
}

function AccountabilityChat({ className }: AccountabilityChatProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<
    AccountabilityMessageResponse[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for existing active sessions
  const { data: activeSessions } = useAccountabilitySessions({
    status: "ACTIVE",
  });
  const { data: sessionData } = useAccountabilitySession(activeSessionId);
  const startSession = useStartSession();
  const completeSession = useCompleteSession();

  const handleStreamComplete = useCallback(
    (message: AccountabilityMessageResponse) => {
      setLocalMessages((prev) => [...prev, message]);
    },
    []
  );

  const { send, abort, isStreaming, streamingContent, streamStage, activeToolCall } =
    useStreamMessage(activeSessionId || "", handleStreamComplete);

  // Set active session from existing sessions
  useEffect(() => {
    if (activeSessions && activeSessions.length > 0 && !activeSessionId) {
      setActiveSessionId(activeSessions[0].id);
    }
  }, [activeSessions, activeSessionId]);

  // Sync messages from session data
  useEffect(() => {
    if (sessionData?.messages) {
      setLocalMessages(sessionData.messages);
    }
  }, [sessionData]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, streamingContent]);

  // Cleanup on unmount
  useEffect(() => () => abort(), [abort]);

  const handleStartSession = async (type: "DAILY_STANDUP" | "FREEFORM") => {
    const session = await startSession.mutateAsync({ type });
    setActiveSessionId(session.id);
    setLocalMessages(session.messages);
  };

  const handleEndSession = async () => {
    if (!activeSessionId) return;
    abort();
    await completeSession.mutateAsync(activeSessionId);
    setActiveSessionId(null);
    setLocalMessages([]);
  };

  const handleSend = async (content: string) => {
    if (!activeSessionId) return;

    // Optimistically add user message
    const tempUserMsg: AccountabilityMessageResponse = {
      id: crypto.randomUUID(),
      sessionId: activeSessionId,
      role: "user",
      content,
      metadata: null,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, tempUserMsg]);

    await send(content);
  };

  // No active session — show start option
  if (!activeSessionId) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-6 p-8 ${className || ""}`}
      >
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Start a Conversation</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Chat with your AI assistant to manage tasks, plan your day, and stay
            on top of your goals.
          </p>
        </div>
        <Button
          variant="default"
          onClick={() => handleStartSession("FREEFORM")}
          isSubmitting={startSession.isPending}
          Initial="New Chat"
          Loading="Starting..."
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">AI Assistant</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEndSession}
          isSubmitting={completeSession.isPending}
          Initial="End Session"
          Loading="Ending..."
          className="w-[200px]"
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {localMessages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role as "user" | "assistant"}
            content={msg.content}
            createdAt={msg.createdAt}
          />
        ))}

        {/* Stage indicator */}
        {isStreaming &&
          !streamingContent &&
          (streamStage === "received" || streamStage === "thinking") && (
            <StreamingStageIndicator stage={streamStage} />
          )}

        {/* Tool call indicator */}
        {isStreaming && streamStage === "tool_calling" && activeToolCall && (
          <div className="flex gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Wrench className="size-3.5 animate-pulse" />
            </div>
            <ShimmeringText
              text={TOOL_LABELS[activeToolCall] || "Running action..."}
              duration={0.3}
              className="text-sm font-bold"
              color="var(--color-neutral-500)"
              shimmeringColor="var(--color-neutral-300)"
            />
          </div>
        )}

        {/* Streaming bubble */}
        {isStreaming && streamingContent && (
          <ChatMessage role="assistant" content={streamingContent} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isLoading={isStreaming}
        placeholder="Ask me anything about your tasks..."
      />
    </div>
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
    <div className="flex gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-3.5 animate-pulse" />
      </div>
      <ShimmeringText
        text={config.labels[labelIndex]}
        duration={0.3}
        className="text-sm font-bold"
        color="var(--color-neutral-500)"
        shimmeringColor="var(--color-neutral-300)"
      />
    </div>
  );
}

export default AccountabilityChat;
