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
import { getRecurrenceLabel } from "@/utils/functions/recurrence";

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
    ? getRecurrenceLabel(recurrenceRule.pattern, recurrenceRule.interval ?? 1)
    : "";
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

export default RecurrenceDisplayerWithIcon;
