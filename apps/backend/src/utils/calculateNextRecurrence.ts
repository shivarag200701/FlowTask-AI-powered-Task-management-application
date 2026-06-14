import type { RecurrenceRule } from "@shiva200701/todotypes";
import { DateTime } from "luxon";

/**
 * Calculates the next recurrence date of the todo
 *
 * @param {RecurrenceRule} recurrenceRule - The recurrence Rule of the todo.
 * @returns {DateTime} The final total price.
 */
function calculateNextRecurrence({
  recurrenceRule,
  dueDate,
  dueTime,
}: {
  recurrenceRule: RecurrenceRule;
  dueDate: string;
  dueTime?: string | null | undefined;
}): DateTime {
  const currentDue = dueTime
    ? DateTime.fromISO(dueTime)
    : DateTime.fromISO(dueDate);
  const interval = recurrenceRule.interval ?? 1;
  switch (recurrenceRule.pattern) {
    case "daily":
      return currentDue.plus({ days: interval });
    case "weekly":
      return currentDue.plus({ weeks: interval });
    case "montly":
      return currentDue.plus({ months: interval });
    case "yearly":
      return currentDue.plus({ years: interval });
  }
}
export default calculateNextRecurrence;
