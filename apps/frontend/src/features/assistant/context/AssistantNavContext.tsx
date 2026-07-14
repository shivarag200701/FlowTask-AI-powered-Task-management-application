import { createContext, useContext, useState, type ReactNode } from "react";

interface AssistantNavContextType {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

const AssistantNavContext = createContext<AssistantNavContextType | null>(null);

export function AssistantNavProvider({ children }: { children: ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/app\/assistant\/([^/]+)/);
    return match ? match[1] : null;
  });

  return (
    <AssistantNavContext.Provider value={{ activeConversationId, setActiveConversationId }}>
      {children}
    </AssistantNavContext.Provider>
  );
}

export function useAssistantNav() {
  const context = useContext(AssistantNavContext);
  if (!context) {
    throw new Error("useAssistantNav must be used within AssistantNavProvider");
  }
  return context;
}
