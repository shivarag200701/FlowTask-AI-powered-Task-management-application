import type { Prisma } from "@prisma/client";
import { type UpdateTodo } from "@shiva200701/todotypes";
import { generateSortKey } from "./todo-ordering.js";
import path from "path";

function constructPatchPayload(patch: UpdateTodo) {
  const updateData: Prisma.TodoUpdateInput = {};

  if (patch.title !== undefined) updateData.title = patch.title;
  if (patch.description !== undefined)
    updateData.description = patch.description;
  if (patch.priority !== undefined) updateData.priority = patch.priority;
  if (patch.color !== undefined) updateData.color = patch.color;
  if (patch.isAllDay !== undefined) updateData.isAllDay = patch.isAllDay;
  if (patch.dueDate !== undefined) updateData.dueDate = patch.dueDate;
  if (patch.dueTime !== undefined) updateData.dueTime = patch.dueTime;
  if (patch.completed !== undefined) {
    updateData.completed = patch.completed;
    updateData.completedAt = patch.completed ? new Date() : null;
  }
  if (patch.projectSectionId !== undefined) {
    if (patch.projectSectionId === null) {
      updateData.projectSection = { disconnect: true };
    } else {
      updateData.projectSection = { connect: { id: patch.projectSectionId } };
    }
  }

  if (patch.sortKey !== undefined) {
    updateData.sortKey = patch.sortKey;
  } else if (patch.prevIndex !== undefined || patch.nextIndex !== undefined) {
    updateData.sortKey = generateSortKey(
      patch.prevIndex ?? null,
      patch.nextIndex ?? null
    );
  }

  return updateData;
}

export default constructPatchPayload;
