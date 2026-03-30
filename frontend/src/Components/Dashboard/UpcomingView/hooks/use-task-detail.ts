import { useState } from "react";
import type { TaskDetailInnerProps } from "../Components/TaskDetailModal";

export function useTaskDetail({
  todo,
  onDelete,
  onEdit,
  onToggleComplete,
  handleDuplicate,
}: TaskDetailInnerProps) {
  const [title, setTitle] = useState(() => {
    return todo.title;
  });
  const [description, setDescription] = useState(() => {
    return todo.description;
  });

  return { title, description, setTitle, setDescription };
}
