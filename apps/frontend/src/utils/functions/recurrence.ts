const patternConfig: Record<
  string,
  { singular: string; plural: string; label: string }
> = {
  daily: { singular: "day", plural: "days", label: "Daily" },
  weekly: { singular: "week", plural: "weeks", label: "Weekly" },
  montly: { singular: "month", plural: "months", label: "Monthly" },
  yearly: { singular: "year", plural: "years", label: "Yearly" },
};

export function getRecurrenceLabel(
  pattern: string,
  interval: number
): string {
  const config = patternConfig[pattern];
  if (!config) return "Repeat";
  if (interval === 1) return config.label;
  return `Every ${interval} ${config.plural}`;
}
