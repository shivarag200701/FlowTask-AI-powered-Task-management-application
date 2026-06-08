import { describe, expect, it } from "vitest";
import pluralize from "./pluralize";

describe("pluralize", () => {
  it("returns singular when the count is 1", () => {
    expect(pluralize("task", 1)).toBe("task");
  });

  it("converts zero entity into plural form", () => {
    expect(pluralize("task", 0)).toBe("tasks");
  });

  it("converts many entity into plural form", () => {
    expect(pluralize("task", 5)).toBe("tasks");
  });

  it("keeps the given plural form when passed as option", () => {
    expect(pluralize("category", 2, { plural: "categories" })).toBe(
      "categories"
    );
  });

  it("keeps the given singular when 1 is passed even tough option is also passed", () => {
    expect(pluralize("category", 1, { plural: "categories" })).toBe("category");
  });
});
