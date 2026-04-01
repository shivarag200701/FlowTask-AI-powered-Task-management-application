export function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(date: Date, days: number) {
  const x = new Date(date);
  x.setDate(x.getDate() + days);
  return x;
}

export function formatWeekdayShort(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

/** YYYY-MM-DD in local calendar (en-CA locale). */
export function formatIsoLocalDate(d: Date) {
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export function getRecurrencePatternMap(selectedDate: string) {
  const date = new Date(selectedDate);
  const day = date.toLocaleDateString("en-US", { weekday: "long" });
  const dayOrdinal = getOrdinal(date.getDate());
  const month = date.toLocaleDateString("en-US", { month: "short" });

  return {
    daily: "Every Day",
    weekly: `every ${day}`,
    monthly: `Every ${dayOrdinal}`,
    yearly: `Every ${dayOrdinal} ${month}`,
  };
}
