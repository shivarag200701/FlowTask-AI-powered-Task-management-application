import type { Todo } from "@/types";
import { useState } from "react";

function useInlineTask(todo: Todo) {
  const [title, setTitle] = useState(() => todo.title);
  const [description, setDescription] = useState(() => todo.description);
  const [priority, setPriority] = useState<Todo["priority"]>(
    () => todo.priority,
  );
  const [reminder, setReminder] = useState(() => todo.reminder);

  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  return {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    isPriorityOpen,
    setIsPriorityOpen,
    isReminderOpen,
    setIsReminderOpen,
    reminder,
    setReminder,
  };
}

export default useInlineTask;
