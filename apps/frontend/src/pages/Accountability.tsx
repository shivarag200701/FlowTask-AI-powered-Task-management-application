import AccountabilityChat from "@/features/accountability/components/AccountabilityChat";
import AccountabilitySettings from "@/features/accountability/components/AccountabilitySettings";
import { Bot, Settings } from "lucide-react";
import { useState } from "react";

function Accountability() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">AI Assistant</h1>
            <p className="text-xs text-muted-foreground">
              Chat with your AI assistant to manage tasks and stay productive
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors"
        >
          <Settings className="size-4" />
        </button>
      </div>

      {showSettings ? (
        <div className="flex-1 overflow-y-auto p-6 max-w-xl">
          <AccountabilitySettings />
        </div>
      ) : (
        <AccountabilityChat className="flex-1 min-h-0" />
      )}
    </div>
  );
}

export default Accountability;
