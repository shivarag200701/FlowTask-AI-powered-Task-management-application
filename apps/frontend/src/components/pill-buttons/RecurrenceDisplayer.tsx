import type { ComponentProps } from "react";
import { Button } from "../ui/button";
import { outlinePopoverTriggerClasses } from "@/lib/constants";
import {
  Repeat,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  CalendarHeart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormContext, useWatch } from "react-hook-form";
import type { CreateTodo } from "@shiva200701/todotypes";

const patternLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  montly: "Monthly",
  yearly: "Yearly",
};

// --- Style 1: Colored badges per pattern ---
const patternColors: Record<string, { text: string; border: string; bg: string }> = {
  daily: { text: "text-green-600", border: "border-green-300", bg: "bg-green-50" },
  weekly: { text: "text-blue-600", border: "border-blue-300", bg: "bg-blue-50" },
  montly: { text: "text-purple-600", border: "border-purple-300", bg: "bg-purple-50" },
  yearly: { text: "text-orange-600", border: "border-orange-300", bg: "bg-orange-50" },
};

export function RecurrenceDisplayerColorBadge({
  ref,
  ...props
}: ComponentProps<typeof Button>) {
  const { control } = useFormContext<CreateTodo>();
  const [recurrenceRule] = useWatch({ control, name: ["recurrenceRule"] });

  const label = recurrenceRule
    ? (patternLabels[recurrenceRule.pattern] ?? "Repeat")
    : "Repeat";
  const colors = recurrenceRule ? patternColors[recurrenceRule.pattern] : null;

  return (
    <Button
      ref={ref}
      {...props}
      variant="outline"
      className={cn(
        "w-full md:w-fit text-sm h-10",
        colors && [colors.text, colors.border, colors.bg],
        outlinePopoverTriggerClasses
      )}
      icon={<Repeat className={cn("size-4", colors && colors.text)} />}
      type="button"
    >
      {label}
    </Button>
  );
}

// --- Style 2: Icon per pattern ---
const patternIcons: Record<string, typeof Repeat> = {
  daily: CalendarDays,
  weekly: CalendarRange,
  montly: CalendarClock,
  yearly: CalendarHeart,
};

export function RecurrenceDisplayerWithIcon({
  ref,
  ...props
}: ComponentProps<typeof Button>) {
  const { control } = useFormContext<CreateTodo>();
  const [recurrenceRule] = useWatch({ control, name: ["recurrenceRule"] });

  const label = recurrenceRule
    ? (patternLabels[recurrenceRule.pattern] ?? "Repeat")
    : "Repeat";
  const Icon = recurrenceRule
    ? (patternIcons[recurrenceRule.pattern] ?? Repeat)
    : Repeat;

  return (
    <Button
      ref={ref}
      {...props}
      variant="outline"
      className={cn(
        "w-full md:w-fit text-sm h-10",
        outlinePopoverTriggerClasses
      )}
      icon={<Icon className="size-4" />}
      type="button"
    >
      {label}
    </Button>
  );
}

// --- Style 3: Filled/solid toggle ---
export function RecurrenceDisplayerFilled({
  ref,
  ...props
}: ComponentProps<typeof Button>) {
  const { control } = useFormContext<CreateTodo>();
  const [recurrenceRule] = useWatch({ control, name: ["recurrenceRule"] });

  const label = recurrenceRule
    ? (patternLabels[recurrenceRule.pattern] ?? "Repeat")
    : "Repeat";

  return (
    <Button
      ref={ref}
      {...props}
      variant={recurrenceRule ? "default" : "outline"}
      className={cn(
        "w-full md:w-fit text-sm h-10",
        !recurrenceRule && outlinePopoverTriggerClasses
      )}
      icon={<Repeat className="size-4" />}
      type="button"
    >
      {label}
    </Button>
  );
}

// --- Style 4: Pill/chip badge ---
export function RecurrenceDisplayerChip({
  ref,
  ...props
}: ComponentProps<typeof Button>) {
  const { control } = useFormContext<CreateTodo>();
  const [recurrenceRule] = useWatch({ control, name: ["recurrenceRule"] });

  return (
    <Button
      ref={ref}
      {...props}
      variant="outline"
      className={cn(
        "w-full md:w-fit text-sm h-10 gap-2",
        outlinePopoverTriggerClasses
      )}
      icon={<Repeat className={cn("size-4", recurrenceRule && "text-blue-600")} />}
      type="button"
    >
      {recurrenceRule ? (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {patternLabels[recurrenceRule.pattern] ?? "Repeat"}
        </span>
      ) : (
        "Repeat"
      )}
    </Button>
  );
}

// Default export — change this to try each style:
// RecurrenceDisplayerColorBadge | RecurrenceDisplayerWithIcon | RecurrenceDisplayerFilled | RecurrenceDisplayerChip
export default RecurrenceDisplayerWithIcon;
