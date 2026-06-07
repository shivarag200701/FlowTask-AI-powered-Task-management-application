import { describe, it, expect } from "vitest";
import { createSlug, extractIdFromSlug } from "./slug.js";

describe("createSlug", () => {
  it("converts title to lowercase kebab-case with id appended", () => {
    expect(createSlug("My Task Title", "abc123")).toBe(
      "my-task-title-abc123",
    );
  });

  it("strips special characters", () => {
    expect(createSlug("Hello, World! #1", "id1")).toBe("hello-world-1-id1");
  });

  it("collapses multiple spaces and hyphens", () => {
    expect(createSlug("too   many   spaces", "x")).toBe(
      "too-many-spaces-x",
    );
  });

  it("trims leading and trailing hyphens from the title portion", () => {
    expect(createSlug("  --edge--  ", "z")).toBe("edge-z");
  });

  it("handles empty title", () => {
    expect(createSlug("", "id")).toBe("-id");
  });
});

describe("extractIdFromSlug", () => {
  it("extracts the id after the last hyphen", () => {
    expect(extractIdFromSlug("my-task-title-abc123")).toBe("abc123");
  });

  it("returns the full string when there is no hyphen", () => {
    expect(extractIdFromSlug("abc123")).toBe("abc123");
  });

  it("handles slugs with many hyphens", () => {
    expect(extractIdFromSlug("a-b-c-d-e")).toBe("e");
  });
});
