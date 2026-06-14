import { cn } from "@/lib/utils";
import type { CreateTodo } from "@shiva200701/todotypes";
import { ArrowLeft, Check, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "../ui/button";
import { DateTime } from "luxon";
import { getRecurrences } from "@/utils/constants/recurrence";

const frequencies = [
  { value: "daily", label: "Day" },
  { value: "weekly", label: "Week" },
  { value: "montly", label: "Month" },
  { value: "yearly", label: "Year" },
] as const;

const weekdays = [
  { value: 1, label: "M" },
  { value: 2, label: "T" },
  { value: 3, label: "W" },
  { value: 4, label: "T" },
  { value: 5, label: "F" },
  { value: 6, label: "S" },
  { value: 7, label: "S" },
];

function RecurrenceDropDown({
  onSelect,
  onClear,
  onClose,
}: {
  onSelect?: () => void;
  onClear?: () => void;
  onClose?: () => void;
}) {
  const { control, setValue } = useFormContext<CreateTodo>();
  const [view, setView] = useState<"presets" | "custom">("presets");

  const [selectedRecurrenceRule] = useWatch({
    control,
    name: ["recurrenceRule"],
  });

  const [dueDate] = useWatch({ control, name: ["dueDate"] });

  const date =
    typeof dueDate === "string"
      ? DateTime.fromISO(dueDate)
      : (dueDate ?? DateTime.now());
  const recurrences = getRecurrences(date);

  // Custom form state — prefill from current recurrence rule
  const [interval, setInterval] = useState(
    selectedRecurrenceRule?.interval ?? 1
  );
  const [frequency, setFrequency] = useState<
    "daily" | "weekly" | "montly" | "yearly"
  >((selectedRecurrenceRule?.pattern as "daily" | "weekly" | "montly" | "yearly") ?? "daily");

  //coming soon
  //   const [selectedDays, setSelectedDays] = useState<number[]>([]);
  //   const toggleDay = (day: number) => {
  //     setSelectedDays((prev) =>
  //       prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
  //     );
  //   };

  const applyCustom = () => {
    setValue(
      "recurrenceRule",
      {
        pattern: frequency,
        interval,
      },
      { shouldDirty: true }
    );
    onSelect?.();
  };

  if (view === "custom") {
    return (
      <div className="flex flex-col gap-3 p-3 text-[13px] w-full sm:w-[280px]">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button
            className="p-1 hover:bg-accent rounded-md"
            onClick={() => setView("presets")}
          >
            <ArrowLeft className="size-4" />
          </button>
          <span className="font-semibold text-sm">Custom repeat</span>
        </div>

        {/* Interval + Frequency */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Every</span>
          <div className="flex items-center border rounded-md">
            <button
              className="p-1.5 hover:bg-accent disabled:opacity-30"
              onClick={() => setInterval((v) => Math.max(1, v - 1))}
              disabled={interval <= 1}
            >
              <Minus className="size-3.5" />
            </button>
            <span className="px-2 min-w-[28px] text-center font-medium">
              {interval}
            </span>
            <button
              className="p-1.5 hover:bg-accent"
              onClick={() => setInterval((v) => v + 1)}
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <select
            className="border rounded-md px-2 py-1.5 bg-background text-[13px]"
            value={frequency}
            onChange={(e) =>
              setFrequency(
                e.target.value as "daily" | "weekly" | "montly" | "yearly"
              )
            }
          >
            {frequencies.map((f) => (
              <option key={f.value} value={f.value}>
                {interval > 1 ? `${f.label}s` : f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Weekday selector (only for weekly) — coming soon */}
        {frequency === "weekly" && (
          <div className="flex flex-col gap-1.5 opacity-50 pointer-events-none select-none">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">On</span>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                Coming soon
              </span>
            </div>
            <div className="flex gap-1">
              {weekdays.map((day) => (
                <div
                  key={day.value}
                  className="size-8 rounded-full text-xs font-medium border flex items-center justify-center"
                >
                  {day.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Apply / Cancel */}
        <div className="flex justify-end gap-2 pt-1 border-t">
          <Button
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => setView("presets")}
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="h-8 text-xs"
            onClick={applyCustom}
            type="button"
          >
            Apply
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1 p-2 text-[13px] w-full sm:w-[250px]">
        {recurrences.map((recurrence) => (
          <button
            key={recurrence.value}
            className={cn(
              "flex items-center justify-start gap-4 px-3 py-2 hover:bg-accent hover:cursor-pointer rounded-md transition-all duration-100"
            )}
            onClick={(e) => {
              if (recurrence.value === "custom") {
                setView("custom");
                return;
              }
              e.stopPropagation();
              setValue(
                "recurrenceRule",
                { pattern: recurrence.value, interval: 1 },
                { shouldDirty: true }
              );
              onSelect?.();
            }}
          >
            <div className="flex gap-2 justify-between w-full">
              <div className="flex gap-2">
                <p className="font-semibold">{recurrence.label}</p>
              </div>
              {selectedRecurrenceRule?.pattern === recurrence.value && (
                <Check className="size-6 sm:size-4" />
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="p-1 border-t text-[13px]">
        <Button
          className="p-1 flex items-center rounded-md justify-center text-red-400 hover:bg-accent hover:cursor-pointer transition-all duration-100"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setValue("recurrenceRule", null, { shouldDirty: true });
            onClear?.();
            onClose?.();
          }}
        >
          Clear
        </Button>
      </div>
    </>
  );
}

export default RecurrenceDropDown;
