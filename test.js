import date from "date-and-time";


const startDate = date.addDays(new Date(new Date().toDateString()), -7);
const endDate = date.addDays(new Date(new Date().toDateString()), -1);

console.log({
  startDate,
  endDate,
  totalDayCount: date.subtract(endDate, startDate).toDays() + 1,
});

const count = date.subtract(endDate, new Date("2024-2-13")).toDays()

console.log(count);