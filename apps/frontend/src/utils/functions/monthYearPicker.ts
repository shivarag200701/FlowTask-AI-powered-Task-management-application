import { DateTime } from "luxon";

export const getMonths = (selectedYear: number) => {
  const today = DateTime.now();
  const currentYear = today.year;
  const currentMonth = today.month;

  const allMonths = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // If selected year is current year, show current month and future months
  if (selectedYear === currentYear) {
    return allMonths.filter((month) => month.value >= currentMonth);
  }

  // For future years, show all months
  return allMonths;
};

export const getYears = () => {
  const currentYear = DateTime.now().year;
  const years = [];
  for (let i = currentYear; i <= currentYear + 10; i++) {
    years.push(i);
  }
  return years;
};

export const isPastDate = (year: number, month: number): boolean => {
  const today = DateTime.now().startOf("day");
  if (month == today.month) {
    return false;
  }
  const date = DateTime.fromObject({ year: year, month: month, day: 1 });
  return date < today;
};
