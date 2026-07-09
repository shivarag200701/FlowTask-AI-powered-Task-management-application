import { Flame, TrendingUp, TrendingDown, Minus, Target, Calendar } from "lucide-react";
import { useAccountabilityStats } from "../hooks/use-accountability";
import { cn } from "@/lib/utils";

function StatsOverview() {
  const { data: stats, isLoading } = useAccountabilityStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const trendIcon = {
    IMPROVING: <TrendingUp className="size-4 text-green-600" />,
    DECLINING: <TrendingDown className="size-4 text-red-500" />,
    STABLE: <Minus className="size-4 text-yellow-500" />,
  };

  const trendLabel = {
    IMPROVING: "Improving",
    DECLINING: "Declining",
    STABLE: "Stable",
  };

  const trendColor = {
    IMPROVING: "text-green-600",
    DECLINING: "text-red-500",
    STABLE: "text-yellow-600",
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {/* Streak */}
      <div className="rounded-xl border p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Flame className="size-4 text-orange-500" />
          <span className="text-xs font-medium">Streak</span>
        </div>
        <p className="text-2xl font-bold">{stats.streak}</p>
        <p className="text-xs text-muted-foreground">days of 100%</p>
      </div>

      {/* 7-day rate */}
      <div className="rounded-xl border p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Target className="size-4 text-blue-500" />
          <span className="text-xs font-medium">7-Day Rate</span>
        </div>
        <p className="text-2xl font-bold">{stats.completionRate7d}%</p>
        <p className="text-xs text-muted-foreground">completion rate</p>
      </div>

      {/* 30-day rate */}
      <div className="rounded-xl border p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Target className="size-4 text-purple-500" />
          <span className="text-xs font-medium">30-Day Rate</span>
        </div>
        <p className="text-2xl font-bold">{stats.completionRate30d}%</p>
        <p className="text-xs text-muted-foreground">completion rate</p>
      </div>

      {/* Trend */}
      <div className="rounded-xl border p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          {trendIcon[stats.trend]}
          <span className="text-xs font-medium">Trend</span>
        </div>
        <p className={cn("text-lg font-semibold", trendColor[stats.trend])}>
          {trendLabel[stats.trend]}
        </p>
        <p className="text-xs text-muted-foreground">vs 30-day average</p>
      </div>

      {/* Sessions this week */}
      <div className="rounded-xl border p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="size-4 text-teal-500" />
          <span className="text-xs font-medium">Check-ins</span>
        </div>
        <p className="text-2xl font-bold">{stats.totalSessionsThisWeek}</p>
        <p className="text-xs text-muted-foreground">this week</p>
      </div>

      {/* Unread insights */}
      <div className="rounded-xl border p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-xs font-medium">Unread Insights</span>
        </div>
        <p className="text-2xl font-bold">{stats.unreadInsights}</p>
        <p className="text-xs text-muted-foreground">to review</p>
      </div>
    </div>
  );
}

export default StatsOverview;
