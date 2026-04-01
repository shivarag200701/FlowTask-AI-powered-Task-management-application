import { getUpcomingDateRange } from "@shiva200701/todotypes";
import { useCallback, useMemo, useState } from "react";
import { DateTime } from "luxon";

export function useUpcomingDateRange(dayCount: number) {
  const [startDate, setStartDate] = useState(() => {
    const now = DateTime.now();
    const start = now.startOf("day");
    return start;
  });

  const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] = useState(false);

  const dateRange = useMemo(() => {
    return getUpcomingDateRange(startDate, dayCount);
  }, [startDate, dayCount]);

  const navigatePrevious = useCallback(() => {
    const candidate = startDate.minus({ days: dayCount });
    if (candidate < DateTime.now().startOf("day")) return;
    setStartDate(candidate);
  }, [dayCount, startDate]);

  DateTime.now;

  const navigateNext = useCallback(() => {
    const candidate = startDate.plus({ days: dayCount });
    setStartDate(candidate);
  }, [dayCount, startDate]);

  const navigateToToday = useCallback(() => {
    const today = DateTime.now().startOf("day");
    setStartDate(today);
  }, []);

  const selectMonthYear = useCallback(
    (year: number, month: number) => {
      const now = DateTime.now();
      if (year === now.year && month === now.month) {
        setStartDate(
          DateTime.now()
            .set({ year: year, month: month, day: now.day })
            .startOf("day"),
        );
      } else {
        setStartDate(
          DateTime.now()
            .set({ year: year, month: month, day: 1 })
            .startOf("day"),
        );
      }
    },
    [startDate, setStartDate],
  );

  const currentMonthYearLabel = useMemo(() => {
    return startDate.toFormat("LLLL yyyy");
  }, [startDate]);

  return {
    startDate,
    setStartDate,
    isMonthYearPickerOpen,
    setIsMonthYearPickerOpen,
    navigatePrevious,
    navigateNext,
    navigateToToday,
    selectMonthYear,
    currentMonthYearLabel,
    dateRange,
  };
}
