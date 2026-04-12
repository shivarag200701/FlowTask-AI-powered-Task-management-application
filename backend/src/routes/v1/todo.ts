//@ts-nocheck
import express from "express";
import { requireLogin } from "../../middleware.js";
import prisma from "../../db/index.js";
import { todoSchema, convertCompleteAtToDate } from "@shiva200701/todotypes";
import notificationService from "../../services/notification/NotificationService.js";
import { flags } from "../../flags.js";

const todoRouter = express();

todoRouter.post("/", requireLogin, async (req, res) => {
  const { data, success, error } = todoSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }
  const {
    title,
    description,
    priority,
    completeAt,
    category,
    color,
    isAllDay,
    reminder,
    order,
  } = data;
  const completeAtDate = convertCompleteAtToDate(completeAt ?? undefined);
  try {
    let todo = await prisma.todo.create({
      data: {
        title,
        description,
        completed: false,
        priority: priority ?? null,
        dueOn: isAllDay ? completeAtDate : null,
        dueAt: !isAllDay ? completeAtDate : null,
        isAllDay,
        sortKey: "",
        color: color ?? null,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    //triggered using feature flag
    if (
      reminder &&
      completeAt &&
      flags.notificationService &&
      notificationService
    ) {
      const notificationPayload = {
        userId: userId,
        type: "task reminder",
        title: title,
        message: todo.description ?? "",
        todoId: todo.id,
        scheduledFor: completeAt,
      };
      try {
        await notificationService.createNotification(notificationPayload);
      } catch (error) {
        console.error("Failed to create notification", error);
        throw error;
      }
    }

    return res.status(200).json({
      msg: "Todo added sucessfully",
      todo: {
        ...todo,
        completeAt: completeAtDate ? completeAtDate.toISOString() : null,
        completedAt: todo.completedAt ? todo.completedAt.toISOString() : null,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt ? todo.updatedAt.toISOString() : null,
        color: todo.color ?? null,
        isAllDay: todo.isAllDay,
        sortKey: todo.sortKey ?? null,
        reminder: reminder,
      },
    });
  } catch (error) {
    console.error("Error while adding todo", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

todoRouter.get("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "Not authorises",
    });
  }
  try {
    // Use UTC for consistent queries regardless of server location
    const now = new Date();
    const today = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const todos = await prisma.todo.findMany({
      where: {
        userId,
      },
      include: {
        notifications: true,
      },
    });

    return res.status(200).json({
      todos: todos.map((todo) => ({
        ...todo,
        completeAt: todo.dueOn
          ? todo.dueOn.toISOString()
          : todo.dueAt
            ? todo.dueAt.toISOString()
            : null,
        isAllDay: todo.isAllDay,
        completedAt: todo.completedAt ? todo.completedAt.toISOString() : null,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt ? todo.updatedAt.toISOString() : null,
        color: todo.color ?? null,
        reminder: todo.notifications.length > 0 ? true : false,
      })),
    });
  } catch (error) {
    console.error("Failed getting todos", error);
    return res.status(500).json({
      msg: "Failed to get todos",
    });
  }
});

// todoRouter.post("/:id/completed", requireLogin, async (req, res) => {
//   const userId = req.session.userId;
//   if (!userId) {
//     return res.status(401).json({
//       msg: "Not authorized",
//     });
//   }
//   const todoId = Array.isArray(req.params.id)
//     ? req.params.id[0]
//     : req.params.id;
//   const body = req.body;
//   if (!todoId) {
//     console.error("No path param ID");
//     return res.status(400).json({ msg: "No todo id found in path" });
//   }

//   // 2. Safely parse the ID
//   const todoIdInt = parseInt(todoId);
//   if (isNaN(todoIdInt)) {
//     return res.status(400).json({ msg: "Invalid todo id format" });
//   }

//   try {
//     if (body.completed == true) {
//       // find the todo to update and check if it is a recurring task
//       const todo = await prisma.todo.findUnique({
//         where: {
//           id: todoIdInt,
//           userId,
//         },
//       });
//       if (!todo) {
//         return res.status(404).json({
//           msg: "Todo not found",
//         });
//       }

//       if (
//         todo.isRecurring &&
//         todo.recurrencePattern &&
//         todo.recurrenceInterval &&
//         todo.nextOccurrence
//       ) {
//         if (
//           todo.recurrenceEndDate &&
//           todo.nextOccurrence > todo.recurrenceEndDate
//         ) {
//           await prisma.todo.update({
//             where: {
//               id: todoIdInt,
//             },
//             data: {
//               completed: body.completed,
//               completedAt: body.completed ? new Date() : null,
//               nextOccurrence: null,
//             },
//           });
//           return res.status(200).json({
//             msg: "Todo completed and no more occurrences",
//           });
//         } else {
//           const newCompleteAtDate = todo.nextOccurrence;
//           const nextOccurence = calculateNextOccurence(
//             todo.recurrencePattern as RecurrencePattern,
//             todo.recurrenceInterval || 1,
//             newCompleteAtDate,
//           );
//           await prisma.todo.update({
//             where: {
//               id: todoIdInt,
//             },
//             data: {
//               dueAt: !todo.isAllDay ? newCompleteAtDate : null,
//               dueOn: todo.isAllDay ? newCompleteAtDate : null,
//               nextOccurrence: nextOccurence,
//             },
//           });
//           return res.status(200).json({
//             msg: "Todo completed and next occurrence set",
//           });
//         }
//       } else {
//         await prisma.todo.update({
//           where: {
//             id: todoIdInt,
//           },
//           data: {
//             completed: body.completed,
//             completedAt: body.completed ? new Date() : null,
//           },
//         });
//       }
//       return res.status(200).json({
//         msg: "non-recurring Todo marked as not complete",
//       });
//     } else {
//       const todo = await prisma.todo.update({
//         where: {
//           id: parseInt(todoId),
//         },
//         data: {
//           completed: body.completed,
//         },
//       });
//       if (!todo) {
//         return res.status(200).json({
//           msg: "No todo found",
//         });
//       }
//       return res.status(200).json({
//         msg: "todo marked as not complete",
//       });
//     }
//   } catch (error) {
//     console.error("Failed getting todos", error);
//     return res.status(500).json({
//       msg: "Failed to get todos",
//     });
//   }
// });

todoRouter.delete("/:id", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "Not authorized",
    });
  }
  const idParam = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
  if (!idParam) {
    return res.status(400).json({
      msg: "No todo id found in path",
    });
  }
  try {
    const notifications = await prisma.notifications.findMany({
      where: {
        todoId: parseInt(idParam),
      },
      select: {
        id: true,
        channels: true,
      },
    });

    //delete notification from the database- best effort clean-up
    try {
      await Promise.all(
        notifications.map((notification) =>
          notificationService.deleteNotification(notification),
        ),
      );
    } catch (queueError) {
      console.error(
        "Failed to remove jobs from queue, continuing with DB delete:",
        queueError,
      );
      //tell monitoring software
    }

    await prisma.todo.delete({
      where: {
        id: parseInt(idParam),
        userId,
      },
    });

    return res.status(200).json({
      msg: "Todo deleted",
    });
  } catch (error) {
    console.error("Failed to delete todo", error);
    return res.status(500).json({
      msg: "Failed to delete todo",
    });
  }
});

todoRouter.put("/:id", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "Not authorized",
    });
  }

  const idParam = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
  if (!idParam) {
    return res.status(400).json({
      msg: "No todo id found in path",
    });
  }

  const { data, success, error } = todoSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }
  const {
    title,
    description,
    priority,
    completeAt,
    category,
    color,
    isAllDay,
    order,
    completed,
  } = data;

  const completeAtDate = convertCompleteAtToDate(completeAt ?? undefined);
  try {
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id: parseInt(idParam),
        userId,
      },
    });
    if (!existingTodo) {
      return res.status(400).json({
        msg: "No todo found",
      });
    }
    const updatedTodo = await prisma.todo.update({
      where: { id: parseInt(idParam) },
      data: {
        title,
        description,
        completed,
        priority: priority ?? null,
        dueOn: isAllDay ? completeAtDate : null,
        dueAt: !isAllDay ? completeAtDate : null,
        isAllDay,
        color: color ?? null,
      },
    });
    return res.status(200).json({
      msg: "Todo updated successfully",
      todo: {
        ...updatedTodo,
        completeAt: completeAtDate ? completeAtDate.toISOString() : null,
        isAllDay: updatedTodo.isAllDay,
        completedAt: updatedTodo.completedAt
          ? updatedTodo.completedAt.toISOString()
          : null,
        createdAt: updatedTodo.createdAt.toISOString(),
        updatedAt: updatedTodo.updatedAt
          ? updatedTodo.updatedAt.toISOString()
          : null,
        color: updatedTodo.color ?? null,
      },
    });
  } catch (error) {
    console.error("Error while updating todo", error);
    return res.status(500).json({
      msg: "Failed to update todo, internal server error",
    });
  }
});

// todoRouter.post("/child_task", requireLogin, async (req, res) => {
//   const userId = req.session.userId;

//   if (!userId) {
//     return res.status(401).json({
//       msg: "Not authorized",
//     });
//   }

//   const { parentId, completeAt, isAllDay } = req.body;

//   if (!parentId || !completeAt) {
//     return res.status(400).json({
//       msg: "parentId and completeAt are required",
//     });
//   }

//   try {
//     //transaction for atomicity
//     const result = await prisma.$transaction(async (tx) => {
//       const parent = await tx.todo.findUnique({
//         where: {
//           id: parseInt(parentId),
//           userId,
//         },
//       });

//       if (!parent) {
//         throw new Error("Parent task not found");
//       }

//       if (!parent.isRecurring || !parent.recurrencePattern) {
//         throw new Error("Parent task is not a recurring task");
//       }

//       if (
//         parent.recurrenceEndDate &&
//         new Date(parent.recurrenceEndDate) < new Date()
//       ) {
//         throw new Error("Recurrence end date has passed");
//       }

//       const childCompleteAt = new Date(completeAt);
//       if (isNaN(childCompleteAt.getTime())) {
//         throw new Error("Invalid completeAt date");
//       }

//       if (parent.dueOn && childCompleteAt <= parent.dueOn) {
//         throw new Error(
//           "Child task completeAt must be after parent task completeAt",
//         );
//       }

//       const existingChild = await tx.todo.findFirst({
//         where: {
//           parentRecurringId: parentId,
//           dueOn: isAllDay ? childCompleteAt : null,
//           dueAt: !isAllDay ? childCompleteAt : null,
//           userId,
//         },
//       });
//       if (existingChild) {
//         return {
//           childTask: existingChild,
//           isNew: false,
//         };
//       }
//       //calculate next occurrence for parent task
//       const nextOccurrence = calculateNextOccurence(
//         parent.recurrencePattern as RecurrencePattern,
//         parent.recurrenceInterval || 1,
//         childCompleteAt,
//       );
//       if (
//         parent.recurrenceEndDate &&
//         nextOccurrence > new Date(parent.recurrenceEndDate)
//       ) {
//         await tx.todo.update({
//           where: { id: parent.id },
//           data: { nextOccurrence: null },
//         });
//       } else {
//         await tx.todo.update({
//           where: { id: parent.id },
//           data: { nextOccurrence: nextOccurrence },
//         });
//       }

//       const completeAtDate = new Date(childCompleteAt);
//       // Use noon UTC to avoid timezone rollover issues
//       completeAtDate.setUTCHours(12, 0, 0, 0);

//       const childTask = await tx.todo.create({
//         data: {
//           title: parent.title,
//           description: parent.description,
//           priority: parent.priority,
//           dueOn: isAllDay ? completeAtDate : null,
//           dueAt: !isAllDay ? completeAtDate : null,
//           category: parent.category,
//           userId,
//           isRecurring: true,
//           recurrencePattern: parent.recurrencePattern,
//           recurrenceInterval: parent.recurrenceInterval,
//           recurrenceEndDate: parent.recurrenceEndDate,
//           parentRecurringId: parent.id,
//           nextOccurrence: null,
//           completed: false,
//         },
//       });
//       return {
//         childTask,
//         isNew: true,
//       };
//     });
//     const formattedChild = {
//       ...result.childTask,
//       dueOn: result.childTask.dueOn
//         ? result.childTask.dueOn.toISOString()
//         : null,
//       dueAt: result.childTask.dueAt
//         ? result.childTask.dueAt.toISOString()
//         : null,
//       completedAt: result.childTask.completedAt
//         ? result.childTask.completedAt.toISOString()
//         : null,
//       recurrenceEndDate: result.childTask.recurrenceEndDate
//         ? result.childTask.recurrenceEndDate.toISOString()
//         : null,
//       nextOccurrence: result.childTask.nextOccurrence
//         ? result.childTask.nextOccurrence.toISOString()
//         : null,
//       createdAt: result.childTask.createdAt.toISOString(),
//       updatedAt: result.childTask.updatedAt
//         ? result.childTask.updatedAt.toISOString()
//         : null,
//     };

//     return res.status(200).json({
//       msg: result.isNew
//         ? "Child task created successfully"
//         : "Child task already exists",
//       childTask: formattedChild,
//       isNew: result.isNew,
//     });
//   } catch (error: any) {
//     console.error("Error creating child task:", error);

//     if (error.message === "Parent task not found or unauthorized") {
//       return res.status(404).json({
//         msg: "Parent task not found or unauthorized",
//       });
//     }

//     if (
//       error.message === "Parent task is not a recurring task" ||
//       error.message === "Recurrence end date has passed" ||
//       error.message === "Invalid completeAt date" ||
//       error.message === "Child task date must be after parent task date"
//     ) {
//       return res.status(400).json({
//         msg: error.message,
//       });
//     }

//     return res.status(500).json({
//       msg: "Internal server error",
//     });
//   }
// });
export default todoRouter;
