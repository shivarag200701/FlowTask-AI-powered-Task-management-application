import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AccountabilityChat from "@/features/accountability/components/AccountabilityChat";
import StatsOverview from "@/features/accountability/components/StatsOverview";
import InsightsCard from "@/features/accountability/components/InsightsCard";
import AccountabilitySettings from "@/features/accountability/components/AccountabilitySettings";
import { useInsights } from "@/features/accountability/hooks/use-accountability";
import { Bot, Settings } from "lucide-react";
import { useState } from "react";

function Accountability() {
  const { data: insights, isLoading: insightsLoading } = useInsights();
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
            <h1 className="text-lg font-semibold">Accountability Partner</h1>
            <p className="text-xs text-muted-foreground">
              AI-powered check-ins, insights, and progress tracking
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
        <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 min-h-0">
            <AccountabilityChat className="h-full" />
          </TabsContent>

          <TabsContent value="insights" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4 max-w-2xl">
              {insightsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
                ))
              ) : insights && insights.length > 0 ? (
                insights.map((insight) => (
                  <InsightsCard key={insight.id} insight={insight} />
                ))
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  <p className="font-medium mb-1">No insights yet</p>
                  <p>Weekly insights will appear here after your first week of using FlowTask.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl">
              <StatsOverview />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default Accountability;
