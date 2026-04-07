import { DateTime } from "luxon";

function currentDay() {
  return DateTime.now().startOf("day").toLocaleString();
}
export default currentDay;
