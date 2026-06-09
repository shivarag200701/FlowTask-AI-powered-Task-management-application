import * as chrono from "chrono-node";
import { DateTime } from "luxon";

export function parseDateTime(
  input: string | null
): { isAllDay: boolean; date: DateTime } | null {
  if (!input) return null;

  const results = chrono.parse(input);

  if (results.length === 0) return null;
  const result = results[0];

  const isAllDay = !result.start.isCertain("hour");
  const date = DateTime.fromJSDate(result.start.date());

  return {
    isAllDay,
    date,
  };
}
