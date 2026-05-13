import type { DateTime } from "luxon";

export type Meridiem = "AM" | "PM";

export function to24Hour(hour12: number, meridiem: Meridiem): number {
  if (meridiem === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

export function displayHour12(dt: DateTime): number {
  const h = dt.hour;
  return h % 12 === 0 ? 12 : h % 12;
}

export function meridiemFrom24(dt: DateTime): Meridiem {
  return dt.hour >= 12 ? "PM" : "AM";
}
