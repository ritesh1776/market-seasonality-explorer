import { getWeek, getMonth, getYear } from "date-fns";

export const getWeeksForCurrentYear = () => {
  const currentWeekNumber = getWeek(new Date());
  return Array.from({ length: currentWeekNumber }, (_, i) => i + 1);
};

export const getMonthsForCurrentYear = () => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonthIndex = getMonth(new Date());
  return monthNames.slice(0, currentMonthIndex + 1);
};

export const getYearsRange = (startYear = 2000) => {
  const currentYear = getYear(new Date());
  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  ).reverse();
};
