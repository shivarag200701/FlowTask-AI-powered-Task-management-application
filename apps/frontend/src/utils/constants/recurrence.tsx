import { DateTime } from "luxon";
import { getOrdinalSuffix } from "../functions/date-ordinal-suffix";
import type { RecurrenceRule } from "@shiva200701/todotypes";
import type { ReactNode } from "react";

type Recurrence = {
  value: RecurrenceRule["pattern"] | "custom";
  label: ReactNode;
};

export function getRecurrences(date: DateTime): Recurrence[] {
  return [
    {
      value: "daily",
      label: "Every day",
    },
    {
      value: "weekly",
      label: (
        <div>
          Every week{" "}
          <span className="text-neutral-400">on {date.weekdayShort}</span>
        </div>
      ),
    },
    {
      value: "montly",
      label: (
        <div>
          Every month{" "}
          <span className="text-neutral-400">
            on the {date.day}
            {getOrdinalSuffix(date.day)}
          </span>
        </div>
      ),
    },
    {
      value: "yearly",
      label: (
        <div>
          Every Year{" "}
          <span className="text-neutral-400">
            on the {date.day}
            {getOrdinalSuffix(date.day)} {date.monthLong}
          </span>
        </div>
      ),
    },
    {
      value: "custom",
      label: "Custom...",
    },
  ];
}
