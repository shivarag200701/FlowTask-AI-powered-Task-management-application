import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userPreferenceKeys } from "@/query-keys";
import { getUserPreference } from "@/api/user";
import api from "@/utils/functions/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const toneOptions = [
  {
    value: "supportive",
    label: "Supportive Coach",
    description: "Warm and encouraging, celebrates wins, gentle about misses",
    preview: `"Great job finishing 4 out of 5 tasks yesterday! That's solid progress. I noticed the report didn't get done — what got in the way? Let's figure out a plan for today."`,
  },
  {
    value: "direct",
    label: "Direct & Factual",
    description: "Numbers-focused, professional, minimal emotional language",
    preview: `"Yesterday: 4/5 tasks completed (80%). One pending: quarterly report. Today you have 3 tasks scheduled. What's your priority order?"`,
  },
  {
    value: "tough",
    label: "Tough Love",
    description: "Blunt, no-nonsense, holds you to high standards",
    preview: `"4 out of 5 — not bad, but that report has been sitting there for 3 days now. What's the holdup? Let's stop pushing it and get it done today. No excuses."`,
  },
] as const;

function AccountabilitySettings() {
  const queryClient = useQueryClient();
  const { data: preferences } = useQuery({
    queryKey: userPreferenceKeys.preferences,
    queryFn: getUserPreference,
  });

  const [tone, setTone] = useState("supportive");
  const [enabled, setEnabled] = useState(true);
  const [standupTime, setStandupTime] = useState("");

  useEffect(() => {
    if (preferences) {
      setTone((preferences as any).accountabilityTone || "supportive");
      setEnabled((preferences as any).accountabilityEnabled ?? true);
      setStandupTime((preferences as any).dailyStandupTime || "");
    }
  }, [preferences]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await api.patch("/api/v1/user/user-preferences", {
        accountabilityTone: tone,
        accountabilityEnabled: enabled,
        dailyStandupTime: standupTime || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPreferenceKeys.preferences });
      toast.success("Accountability settings saved");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-1">AI Assistant</h3>
        <p className="text-xs text-muted-foreground">
          Configure your AI assistant preferences.
        </p>
      </div>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Enable AI Assistant</p>
          <p className="text-xs text-muted-foreground">Task assistance and check-ins</p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            enabled ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform shadow-sm",
              enabled && "translate-x-5"
            )}
          />
        </button>
      </div>

      {enabled && (
        <>
          {/* Tone selector */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Communication Style</p>
            <div className="space-y-2">
              {toneOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTone(option.value)}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-all",
                    tone === option.value
                      ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20"
                      : "hover:border-border/80"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "size-3 rounded-full border-2",
                        tone === option.value ? "border-primary bg-primary" : "border-muted-foreground/30"
                      )}
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-5 mb-2">{option.description}</p>
                  <p className="text-xs text-foreground/60 ml-5 italic">{option.preview}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Standup time */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Daily Standup Time</p>
            <p className="text-xs text-muted-foreground">When should we remind you to check in?</p>
            <input
              type="time"
              value={standupTime}
              onChange={(e) => setStandupTime(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

        </>
      )}

      <Button
        variant="default"
        onClick={() => saveMutation.mutate()}
        isSubmitting={saveMutation.isPending}
        Initial="Save Settings"
        Loading="Saving..."
        className="w-auto"
      />
    </div>
  );
}

export default AccountabilitySettings;
