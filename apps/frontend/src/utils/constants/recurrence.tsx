import type { RecurrenceRule } from "@shiva200701/todotypes";
import { DateTime } from "luxon";
import type { ReactNode } from "react";
import { getOrdinalSuffix } from "../functions/date-ordinal-suffix";

type Recurrence = {
  value: RecurrenceRule["pattern"] | "custom";
  label: ReactNode;
};
const today = DateTime.now();

export const Recurrences: Recurrence[] = [
  {
    value: "daily",
    label: "Every day",
  },
  {
    value: "weekly",
    label: (
      <div>
        Every week{" "}
        <span className="text-neutral-400">on {today.weekdayShort}</span>
      </div>
    ),
  },
  {
    value: "montly",
    label: (
      <div>
        Every month{" "}
        <span className="text-neutral-400">
          on the {today.day}
          {getOrdinalSuffix(today.day)}
        </span>
      </div>
    ),
  },
  {
    value: "yearly",
    label: (
      <div>
        Every month{" "}
        <span className="text-neutral-400">
          on the {today.day}
          {getOrdinalSuffix(today.day)} {today.monthLong}
        </span>
      </div>
    ),
  },
  {
    value: "custom",
    label: "Custom...",
  },
];
