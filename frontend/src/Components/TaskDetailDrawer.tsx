import { useState, useRef, useEffect } from "react";
import type { Todo } from "../types";
import { Button } from "./ui/button";
import {
  Bell,
  Clock4,
  CopyPlus,
  MoreHorizontal,
  Play,
  Trash2,
  X,
  Check,
  Pencil,
  TextAlignStart,
  Inbox,
  ChevronDown,
  ChevronUp,
  Calendar,
  RefreshCw,
  Flag,
} from "lucide-react";
import { formatCompleteAt } from "@shiva200701/todotypes";
import api from "../utils/api";
import AddTaskCalender from "./AddTaskCalender";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CustomDatePicker from "./CustomDatePicker";
import { roundToNearest15Minutes, getTimeFromDate } from "./InlineTaskForm";
import PriorityPicker from "./PriorityPicker";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Kbd } from "./ui/kbd";
import { TaskDetailPopover } from "./Dashboard/UpcomingView/Components/TaskDetailModal";

interface TaskDetailDrawerProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (todo: Todo) => void;
  onToggleComplete: (todoId: string | number) => void;
  onDelete: (todoId: string | number) => void;
  handleDuplicate: (todo: Todo) => void;
  editAllowed?: boolean;
}

const labelClass = "text-xs uppercase tracking-wide text-muted-foreground";

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const TaskDetailDrawer = ({
  todo,
  onEdit,
  onClose,
  onToggleComplete,
  onDelete,
  handleDuplicate,
  editAllowed,
}: TaskDetailDrawerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const justClosedDropdownRef = useRef(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isAllDay, setIsAllDay] = useState(true);
  const [selectedTime, setSelectedTime] = useState<string>(
    roundToNearest15Minutes(new Date()),
  );
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<
    "daily" | "weekly" | "monthly" | "yearly" | null
  >(null);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>("");
  const [recurrenceInterval, setRecurrenceInterval] = useState<number | null>(
    null,
  );
  const [priority, setPriority] = useState<"high" | "medium" | "low" | null>(
    null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const dateButtonRef = useRef<HTMLDivElement>(null);
  const hasChangesRef = useRef(false);
  const priorityButtonRef = useRef<HTMLButtonElement>(null);

  // Use useQuery for todos - data is already cached from RequireAuth
  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await api.get("/v1/todo/");
      return res.data.todos;
    },
  });
  const idArray = todos.map((todo) => todo.id);

  const taskIdParam = searchParams.get("task");
  const currentId = taskIdParam ? parseInt(taskIdParam) : null;
  const currentIndex = currentId != null ? idArray.indexOf(currentId) : -1;

  const isAtTop = currentIndex <= 0;
  const isAtBottom = currentIndex === idArray.length - 1;
  const priorityColors = {
    high: "text-red-500",
    medium: "text-blue-500",
    low: "text-green-500",
    undefined: "text-gray-500",
  };

  function getDateFromDate(date: string) {
    if (!date) return "";
    if (!todo?.isAllDay) {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } else {
      return date.split("T")[0];
    }
  }

  useEffect(() => {
    if (todo) {
      setSelectedDate(getDateFromDate(todo?.completeAt ?? ""));
      setIsAllDay(todo.isAllDay ?? true);

      if (!todo.isAllDay) {
        setSelectedTime(getTimeFromDate(todo?.completeAt ?? ""));
      } else {
        setSelectedTime(roundToNearest15Minutes(new Date()));
      }
      const initPriority = (todo.priority as "high" | "medium" | "low") ?? null;
      setPriority(initPriority);
      const initIsRecurring = todo.isRecurring || false;
      const initRecurrencePattern = todo.recurrencePattern ?? null;
      const initRecurrenceInterval = todo.recurrenceInterval ?? null;
      const initRecurrenceEndDate = todo.recurrenceEndDate
        ? new Date(todo.recurrenceEndDate).toISOString().split("T")[0]
        : "";

      setIsRecurring(initIsRecurring);
      setRecurrencePattern(initRecurrencePattern);
      setRecurrenceInterval(initRecurrenceInterval);
      setRecurrenceEndDate(initRecurrenceEndDate);
    }
  }, [todo]);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        // Set flag to prevent edit from opening immediately after closing dropdown
        justClosedDropdownRef.current = true;
        // Clear the flag after a short delay to allow normal clicks again
        setTimeout(() => {
          justClosedDropdownRef.current = false;
        }, 100);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const combineDateAndTime = (date: string, time: string) => {
    let dateObj;
    if (!date || !time) return "";
    const [year, month, day] = date.split("-").map(Number);
    dateObj = new Date(year, month - 1, day);

    const [hours, minutes] = time.split(":").map(Number);

    dateObj.setHours(hours, minutes, 0, 0);

    return dateObj.toISOString();
  };

  const handleStartEdit = () => {
    if (!todo) return;

    // Prevent edit from opening if dropdown was just closed (user clicked to close dropdown)
    if (justClosedDropdownRef.current) {
      return;
    }

    setIsEditing(true);
    setEditedTitle(todo.title);
    setEditedDescription(todo.description || "");
  };

  const handleCancelEdit = () => {
    if (!todo) return;
    setIsEditing(false);
    setEditedTitle(todo.title);
    setEditedDescription(todo.description || "");
  };

  const handleSave = async () => {
    if (!todo || !todo.id) return;

    // setIsSaving(true);
    try {
      const updatedTodo: Todo = {
        ...todo,
        title: editedTitle,
        description: editedDescription,
      };
      onEdit(updatedTodo);
      setIsEditing(false);
      const payload: any = {
        title: editedTitle,
        description: editedDescription,
        completeAt: todo.completeAt,
        category: todo.category,
        priority: todo.priority ?? null,
        isRecurring: todo.isRecurring || false,
        color: todo.color ?? null,
        isAllDay: todo.isAllDay ?? null,
      };

      if (todo.isRecurring) {
        payload.recurrencePattern = todo.recurrencePattern;
        payload.recurrenceInterval = todo.recurrenceInterval;
        if (todo.recurrenceEndDate) {
          payload.recurrenceEndDate = todo.recurrenceEndDate;
        }
      }

      await api.put(`/v1/todo/${todo.id}`, payload);
    } catch (error) {
      console.error("Error updating todo", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!todo) {
    return null;
  }
  const handleToggleComplete = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    onToggleComplete(todo.id! as string | number);
    onClose();
  };
  const formatDate = (isoDate: string | null) => {
    if (!isoDate) return;

    const date = new Date(isoDate);

    const formattedDate = date.toLocaleDateString("en-Us", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return formattedDate.replace(",", " ").replace(",", " · ");
  };

  const handleBefore = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("task", String(idArray[currentIndex - 1]));
    setSearchParams(params, { replace: false });
  };

  const handleAfter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("task", String(idArray[currentIndex + 1]));
    setSearchParams(params, { replace: false });
  };
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const convertDateTime = (
    dateStr: string | null,
    time: string | null,
  ): string | null => {
    if (!dateStr) return null;

    if (!todo.isAllDay && !time) return null;

    if (!todo?.isAllDay) {
      dateStr = dateStr.split("T")[0];
    }
    // Parse YYYY-MM-DD string as local date (not UTC)
    const [year, month, day] = dateStr.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(0, 0, 0, 0);

    //timelabel
    const timeLabel = formatTime(time);

    return timeLabel
      ? `${selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).replaceAll(",", "")} ${timeLabel}`
      : `${selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).replaceAll(",", "")} 11:59 PM`;
  };

  const getReccurenceLabel = (): string | null => {
    let reccurenceLabel = "";
    const date = new Date(selectedDate);
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const dayOrdinal = getOrdinal(date.getDate());
    const month = date.toLocaleDateString("en-US", { month: "long" });

    if (todo.isRecurring) {
      const reccurencePatten = todo.recurrencePattern;
      switch (reccurencePatten) {
        case "daily":
          reccurenceLabel = todo?.isAllDay
            ? "every day"
            : `every day at ${formatTime(selectedTime)}`;
          break;

        case "weekly":
          reccurenceLabel = todo?.isAllDay
            ? `every ${day}`
            : `every ${day} at ${formatTime(selectedTime)}`;
          break;

        case "monthly":
          reccurenceLabel = todo?.isAllDay
            ? `every ${dayOrdinal}`
            : `every ${dayOrdinal} at ${formatTime(selectedTime)}`;
          break;

        case "yearly":
          reccurenceLabel = todo?.isAllDay
            ? `every ${dayOrdinal} ${month}`
            : `every ${dayOrdinal} ${month} at ${formatTime(selectedTime)}`;
          break;
      }
    }
    return reccurenceLabel;
  };

  const formatTime = (time: string | null): string | null => {
    let timeLabel = "";
    if (!todo?.isAllDay && time) {
      const [hours, minutes] = time.split(":");
      const hour24 = parseInt(hours);
      const ampm = hour24 >= 12 ? "PM" : "AM";
      const hour12 = hour24 % 12 || 12;
      timeLabel = `${hour12}:${minutes} ${ampm}`;
    }
    return timeLabel;
  };

  const getDateLabel = (
    dateStr: string | null,
    time: string | null,
  ): string | null => {
    if (!dateStr) return null;

    if (!dateStr && !time) return null;

    if (!todo?.isAllDay) {
      dateStr = dateStr.split("T")[0];
    }
    // Parse YYYY-MM-DD string as local date (not UTC)
    const [year, month, day] = dateStr.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeLabel = formatTime(time);

    if (selectedDate.getTime() === today.getTime()) {
      return !todo?.isAllDay ? `Today ${timeLabel}` : "Today";
    } else if (selectedDate.getTime() === tomorrow.getTime()) {
      return !todo?.isAllDay ? `Tomorrow ${timeLabel}` : "Tomorrow";
    } else {
      // For other dates, return formatted date
      return !todo?.isAllDay
        ? `${selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${timeLabel}`
        : selectedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
    }
  };

  const dayLeft = (dateStr: string | null): string | null => {
    if (!dateStr) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = dateStr.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(0, 0, 0, 0);

    const diffInMs = Math.abs(selectedDate.getTime() - today.getTime());
    const dayDiff = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    if (dayDiff == 0) return null;

    return dayDiff === 1 ? `${dayDiff} day left` : `${dayDiff} days left`;
  };

  const handleDateSelect = async (date: string, isQuickAction?: boolean) => {
    if (!date) return;
    let finalDate = date;
    if (!todo?.isAllDay && selectedTime) {
      finalDate = combineDateAndTime(date, selectedTime);
    }

    setSelectedDate(finalDate);
    const updatedTodo: Todo = {
      ...todo,
      completeAt: finalDate,
    };

    onEdit(updatedTodo);
    if (isQuickAction) {
      setShowDatePicker(false);
    }
    try {
      const payload: any = {
        title: todo.title,
        description: todo.description,
        completeAt: finalDate,
        category: todo.category,
        priority: todo.priority ?? null,
        isRecurring: todo.isRecurring || false,
        color: todo.color ?? null,
        isAllDay: todo.isAllDay ?? null,
      };

      if (todo.isRecurring) {
        payload.recurrencePattern = todo.recurrencePattern;
        payload.recurrenceInterval = todo.recurrenceInterval;
        if (todo.recurrenceEndDate) {
          payload.recurrenceEndDate = todo.recurrenceEndDate;
        }
      }

      await api.put(`/v1/todo/${todo.id}`, payload);
    } catch (error) {
      console.error("error updating the date", error);
    }
  };
  const handleNoDate = async () => {
    setSelectedDate("");
    setIsRecurring(false);
    setIsAllDay(true);
    setSelectedTime(roundToNearest15Minutes(new Date()));
    const updatedTodo: Todo = {
      ...todo,
      completeAt: null,
      isRecurring: false,
      isAllDay: true,
      recurrencePattern: null,
      recurrenceInterval: null,
      recurrenceEndDate: null,
    };
    onEdit(updatedTodo);
    try {
      const payload: any = {
        title: todo.title,
        description: todo.description,
        completeAt: null,
        category: todo.category,
        priority: todo.priority ?? null,
        isRecurring: false,
        recurrencePattern: null,
        recurrenceInterval: null,
        recurrenceEndDate: null,
        color: todo.color ?? null,
        isAllDay: true,
      };

      if (todo.isRecurring) {
        payload.recurrencePattern = todo.recurrencePattern;
        payload.recurrenceInterval = todo.recurrenceInterval;
        if (todo.recurrenceEndDate) {
          payload.recurrenceEndDate = todo.recurrenceEndDate;
        }
      }

      await api.put(`/v1/todo/${todo.id}`, payload);
    } catch (error) {
      console.error("error updating the time", error);
    }
  };
  const handleNoTime = async () => {
    setSelectedTime(roundToNearest15Minutes(new Date()));
    setIsAllDay(true);
    const updatedTodo: Todo = {
      ...todo,
      completeAt: selectedDate,
      isRecurring: isRecurring,
      isAllDay: true,
      recurrencePattern: recurrencePattern,
      recurrenceInterval: recurrenceInterval,
      recurrenceEndDate: recurrenceEndDate,
    };
    onEdit(updatedTodo);
    try {
      const payload: any = {
        title: todo.title,
        description: todo.description,
        completeAt: selectedDate,
        category: todo.category,
        priority: todo.priority ?? null,
        isRecurring: isRecurring,
        recurrencePattern: recurrencePattern,
        recurrenceInterval: recurrenceInterval,
        recurrenceEndDate: recurrenceEndDate,
        color: todo.color ?? null,
        isAllDay: true,
      };

      if (todo.isRecurring) {
        payload.recurrencePattern = todo.recurrencePattern;
        payload.recurrenceInterval = todo.recurrenceInterval;
        if (todo.recurrenceEndDate) {
          payload.recurrenceEndDate = todo.recurrenceEndDate;
        }
      }

      await api.put(`/v1/todo/${todo.id}`, payload);
    } catch (error) {
      console.error("error updating the time", error);
    }
  };

  const handleTimeSave = async () => {
    if (!selectedTime || !selectedDate) return;

    // Get the date part (YYYY-MM-DD) from selectedDate
    const datePart = selectedDate.includes("T")
      ? selectedDate.split("T")[0]
      : selectedDate;

    const combinedDate = combineDateAndTime(datePart, selectedTime);
    setSelectedDate(combinedDate);
    setIsAllDay(false);

    const updatedTodo: Todo = {
      ...todo,
      completeAt: combinedDate,
      isAllDay: false,
    };

    onEdit(updatedTodo);

    try {
      const payload: any = {
        title: todo.title,
        description: todo.description,
        completeAt: combinedDate,
        category: todo.category,
        priority: todo.priority ?? null,
        isRecurring: todo.isRecurring || false,
        color: todo.color ?? null,
        isAllDay: false,
      };

      if (todo.isRecurring) {
        payload.recurrencePattern = todo.recurrencePattern;
        payload.recurrenceInterval = todo.recurrenceInterval;
        if (todo.recurrenceEndDate) {
          payload.recurrenceEndDate = todo.recurrenceEndDate;
        }
      }

      await api.put(`/v1/todo/${todo.id}`, payload);
    } catch (error) {
      console.error("error updating the time", error);
    }
  };

  const handlePrioritySelect = async (
    priority: "high" | "medium" | "low" | null,
  ) => {
    if (!priority) return;

    setPriority(priority);

    const updatedTodo: Todo = {
      ...todo,
      priority: priority,
    };
    onEdit(updatedTodo);
    try {
      const payload: any = {
        title: todo.title,
        description: todo.description,
        completeAt: todo.completeAt,
        category: todo.category,
        priority: priority,
        isRecurring: todo.isRecurring || false,
        color: todo.color ?? null,
        isAllDay: todo.isAllDay,
      };

      if (todo.isRecurring) {
        payload.recurrencePattern = todo.recurrencePattern;
        payload.recurrenceInterval = todo.recurrenceInterval;
        if (todo.recurrenceEndDate) {
          payload.recurrenceEndDate = todo.recurrenceEndDate;
        }
      }

      await api.put(`/v1/todo/${todo.id}`, payload);
    } catch (error) {
      console.error("error updating the priority", error);
    }
  };

  const handleRecurringSelect = async (config: {
    isRecurring: boolean;
    recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly";
    recurrenceInterval?: number;
    recurrenceEndDate?: string | null;
  }) => {
    if (!config) return;
    setIsRecurring(config.isRecurring || false);
    if (config.recurrencePattern) {
      setRecurrencePattern(config.recurrencePattern);
    }
    if (config.recurrenceInterval) {
      setRecurrenceInterval(config.recurrenceInterval);
    }
    if (config.recurrenceEndDate !== undefined) {
      setRecurrenceEndDate(config.recurrenceEndDate || "");
    }

    const updatedTodo: Todo = {
      ...todo,
      isRecurring: config.isRecurring,
      recurrencePattern: config.recurrencePattern,
      recurrenceInterval: config.recurrenceInterval,
      recurrenceEndDate: config.recurrenceEndDate,
    };
    onEdit(updatedTodo);
    try {
      const payload: any = {
        title: todo.title,
        description: todo.description,
        completeAt: todo.completeAt,
        category: todo.category,
        priority: todo.priority ?? null,
        isRecurring: config.isRecurring || false,
        recurrencePattern: config.recurrencePattern,
        recurrenceInterval: config.recurrenceInterval,
        recurrenceEndDate: config.recurrenceEndDate,
        color: todo.color ?? null,
        isAllDay: false,
      };

      await api.put(`/v1/todo/${todo.id}`, payload);
    } catch (error) {
      console.error("error updating the time", error);
    }
  };

  const dateLabel = getDateLabel(selectedDate, selectedTime);
  return <div>Hi there</div>;
};

export default TaskDetailDrawer;
