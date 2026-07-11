export const TASK_TOOLS = [
  {
    type: "function",
    function: {
      name: "complete_task",
      description: "Mark a task as completed",
      parameters: {
        type: "object",
        properties: {
          task_id: {
            type: "string",
            description: "The ID of the task to complete",
          },
        },
        required: ["task_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reschedule_task",
      description: "Move a task to a new date",
      parameters: {
        type: "object",
        properties: {
          task_id: { type: "string", description: "The ID of the task" },
          new_date: {
            type: "string",
            description: "New due date in YYYY-MM-DD format",
          },
        },
        required: ["task_id", "new_date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new task for the user",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          due_date: { type: "string", description: "YYYY-MM-DD" },
          priority: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_tasks_for_date",
      description: "Fetch tasks for a specific date",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "YYYY-MM-DD" },
        },
        required: ["date"],
      },
    },
  },
];
