import { getUpcomingDateRange } from "@shiva200701/todotypes";
import { useCallback, useMemo, useState } from "react";

export function useUpcomingDateRange(dayCount: number) {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] = useState(false);

  const dateRange = useMemo(() => {
    return getUpcomingDateRange(startDate, dayCount);
  }, [startDate, dayCount]);

  const navigatePrevious = useCallback(() => {
    let newDate = new Date(startDate);

    newDate.setDate(startDate.getDate() - dayCount);
    newDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDate >= today) {
      setStartDate(newDate);
    } else {
      setStartDate(today);
    }
  }, [dayCount, startDate]);

  const navigateNext = useCallback(() => {
    let newDate = new Date(startDate);

    newDate.setDate(startDate.getDate() + dayCount);
    newDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDate >= today) {
      setStartDate(newDate);
    } else {
      setStartDate(today);
    }
  }, [dayCount, startDate]);

  const navigateToToday = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setStartDate(today);
  }, []);

  const selectMonthYear = useCallback(
    (year: number, month: number) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const currentDay = today.getDate();

      let newDate: Date;

      // If selecting current year and current month, start from today
      if (year === currentYear && month === currentMonth) {
        newDate = new Date(year, month, currentDay);
      } else {
        // Otherwise, start from the 1st of the selected month
        newDate = new Date(year, month, 1);
      }

      newDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      // Only allow selecting today or future dates
      if (newDate >= today) {
        setStartDate(newDate);
      }
    },
    [startDate, setStartDate],
  );

  const currentMonthYearLabel = useMemo(
    () =>
      startDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [startDate],
  );

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
