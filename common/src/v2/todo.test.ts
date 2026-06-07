import { describe, it, expect } from "vitest";
import { CreateTodoSchema, UpdateTodoSchema } from "./todo.js";

describe("CreateTodoSchema", () => {
  const validTodo = {
    title: "Buy groceries",
    priority: "high",
    dueDate: "2026-06-10",
    dueTime: null,
  };

  it("accepts a valid todo", () => {
    const result = CreateTodoSchema.safeParse(validTodo);
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = CreateTodoSchema.safeParse({ ...validTodo, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid priority", () => {
    const result = CreateTodoSchema.safeParse({
      ...validTodo,
      priority: "urgent",
    });
    expect(result.success).toBe(false);
  });

  it("transforms a comma-separated tags string into an array", () => {
    const result = CreateTodoSchema.parse({
      ...validTodo,
      tags: "tag1,tag2,tag3",
    });
    expect(result.tags).toEqual(["tag1", "tag2", "tag3"]);
  });

  it("passes through tags that are already an array", () => {
    const result = CreateTodoSchema.parse({
      ...validTodo,
      tags: ["a", "b"],
    });
    expect(result.tags).toEqual(["a", "b"]);
  });
});

describe("UpdateTodoSchema", () => {
  it("accepts a partial update with only title", () => {
    const result = UpdateTodoSchema.safeParse({ title: "New title" });
    expect(result.success).toBe(true);
  });

  it("accepts update-specific fields like completed and sortKey", () => {
    const result = UpdateTodoSchema.safeParse({
      completed: true,
      sortKey: "a0",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(true);
      expect(result.data.sortKey).toBe("a0");
    }
  });

  it("accepts an empty object (all fields optional)", () => {
    const result = UpdateTodoSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
