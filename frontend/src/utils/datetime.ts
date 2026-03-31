import { DateTime } from "luxon";

export function toLuxonDate(date: Date) {
  return DateTime.fromJSDate(date, { zone: "local" });
}
