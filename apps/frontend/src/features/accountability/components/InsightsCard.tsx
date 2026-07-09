import { TrendingUp, TrendingDown, Minus, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeeklyInsightResponse } from "@shiva200701/todotypes";
import { useMarkInsightRead } from "../hooks/use-accountability";

interface InsightsCardProps {
  insight: WeeklyInsightResponse;
}

function InsightsCard({ insight }: InsightsCardProps) {
  const markRead = useMarkInsightRead();

  const trendConfig = {
    IMPROVING: { icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", label: "Improving" },
    DECLINING: { icon: TrendingDown, color: "text-red-500", bg: "bg-red-50", label: "Declining" },
    STABLE: { icon: Minus, color: "text-yellow-600", bg: "bg-yellow-50", label: "Stable" },
  };

  const trend = trendConfig[insight.trend];
  const TrendIcon = trend.icon;
  const isUnread = !insight.readAt;

  const handleMarkRead = () => {
    if (isUnread) {
      markRead.mutate(insight.id);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-5 space-y-4 transition-colors",
        isUnread && "border-primary/30 bg-primary/[0.02]"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">
              Week of {insight.weekStartDate} - {insight.weekEndDate}
            </h3>
            {isUnread && (
              <span className="size-2 rounded-full bg-primary" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">{Math.round(insight.overallCompletionRate)}%</span>
            <div className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", trend.bg, trend.color)}>
              <TrendIcon className="size-3" />
              {trend.label}
            </div>
            {insight.previousWeekRate !== null && (
              <span className="text-xs text-muted-foreground">
                vs {Math.round(insight.previousWeekRate)}% prev
              </span>
            )}
          </div>
        </div>
        {isUnread && (
          <button
            onClick={handleMarkRead}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <Eye className="size-3" />
            Mark read
          </button>
        )}
      </div>

      {/* Summary */}
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
        {insight.summary}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {insight.mostProductiveDay && (
          <span>Best day: <span className="font-medium text-foreground">{insight.mostProductiveDay}</span></span>
        )}
        {insight.leastProductiveDay && (
          <span>Needs work: <span className="font-medium text-foreground">{insight.leastProductiveDay}</span></span>
        )}
      </div>
    </div>
  );
}

export default InsightsCard;
