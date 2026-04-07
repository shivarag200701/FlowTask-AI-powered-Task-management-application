import { DateTime } from "luxon";

function formatDate(date: DateTime) {
  return date.toFormat("MMM d");
}
export default formatDate;
