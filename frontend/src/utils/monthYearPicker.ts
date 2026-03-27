export const getMonths = (selectedYear: number) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const allMonths = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  // If selected year is current year, show current month and future months
  if (selectedYear === currentYear) {
    return allMonths.filter((month) => month.value >= currentMonth);
  }

  // For future years, show all months
  return allMonths;
};

export const getYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i <= currentYear + 10; i++) {
    years.push(i);
  }
  return years;
};

export const isPastDate = (year: number, month: number): boolean => {
  const today = new Date();
  if (month == today.getMonth()) {
    return false;
  }
  const date = new Date(year, month, 1);
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return date < today;
};
