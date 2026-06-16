import type { TodoWithCompleteAtDateTime } from "@/types";

type Priority = {
  id: TodoWithCompleteAtDateTime["priority"];
  label: string;
  textClass: string;
  fillColor: string;
};

export const priorities: Priority[] = [
  {
    id: "high",
    label: "High",
    textClass: "text-red-500",
    fillColor: "#ef4444",
  },
  {
    id: "medium",
    label: "Medium",
    textClass: "text-amber-500",
    fillColor: "#f59e0b",
  },
  { id: "low", label: "Low", textClass: "text-blue-500", fillColor: "#3b82f6" },
  {
    id: null,
    label: "None",
    textClass: "text-gray-400",
    fillColor: "#9ca3af",
  },
];

export const priorityStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};
