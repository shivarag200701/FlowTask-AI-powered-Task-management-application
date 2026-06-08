import { describe, expect, it } from "vitest";
import { displayHour12, meridiemFrom24, to24Hour } from "./twelve-hour-time";
import { DateTime } from "luxon";

describe("time conversion", () => {
  describe("12 hour time to 24 hour", () => {
    it("12 in the night returns 0", () => {
      expect(to24Hour(12, "AM")).toBe(0);
    });
    it("12 in the afternoon returns 12", () => {
      expect(to24Hour(12, "PM")).toBe(12);
    });
    it("3 in the afternoon returns 15", () => {
      expect(to24Hour(3, "PM")).toBe(15);
    });
    it("7 in the morning returns 7", () => {
      expect(to24Hour(7, "AM")).toBe(7);
    });
  });

  describe("24hr time to 12hr with meridiem", () => {
    it("0 in 24hr returns 12", () => {
      const time = DateTime.fromObject({ hour: 0 });
      expect(`${displayHour12(time)} ${meridiemFrom24(time)}`).toBe("12 AM");
    });

    it("12 in 24hr returns 12", () => {
      const time = DateTime.fromObject({ hour: 12 });
      expect(`${displayHour12(time)} ${meridiemFrom24(time)}`).toBe("12 PM");
    });

    it("15 in 24hr returns 3", () => {
      const time = DateTime.fromObject({ hour: 15 });
      expect(`${displayHour12(time)} ${meridiemFrom24(time)}`).toBe("3 PM");
    });

    it("7 in 24hr returns 7", () => {
      const time = DateTime.fromObject({ hour: 7 });
      expect(`${displayHour12(time)} ${meridiemFrom24(time)}`).toBe("7 AM");
    });
  });
});
