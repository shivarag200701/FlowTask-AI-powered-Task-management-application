import { DateTime } from "luxon";

export function formatDatetime(
  date: DateTime | null,
  isAllDay?: boolean,
): string {
  if (!date) return "";

  if (isAllDay) {
    return date.toFormat("ccc, LLL d");
  }

  return date.toFormat("ccc, LLL d, h:mm a");
}
