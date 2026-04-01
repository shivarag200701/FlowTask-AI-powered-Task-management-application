import type { Todo } from "@/types";
import type { Dispatch, SetStateAction } from "react";

export interface CustomDatePickerProps {
  // onClose: () => void;
  // selectedDate: string; // YYYY-MM-DD format
  // onDateSelect: (date: string) => void;
  // selectedTime: string;
  // onTimeSelect?: (time: string) => void;
  // noTimeSelect?: () => void;
  // todos: Todo[];
  // todo?: Todo;
  // isAllDay: boolean;
  // isRecurring: boolean;
  // recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly" | null;
  // onSave?: () => void;
  // setIsAllDay: (isAllDay: boolean) => void;
  // setIsRecurring: (isRecurring: boolean) => void;
  // setRecurrencePattern: (
  //   pattern: "daily" | "weekly" | "monthly" | "yearly" | null,
  // ) => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface TimeOption {
  value: string;
  label: string;
}

export interface ParsedDateResult {
  date: string | null; // YYYY-MM-DD format
  isRecurring: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly";
  recurrenceInterval?: number;
  recurrenceEndDate?: string | null;
  confidence: "high" | "medium" | "low";
  error?: string;
  displayText?: string;
  matchedString?: string;
}

export type NLPDateParserProps = {
  onApply: () => void; // or handleApplyDate: () => void
  nlpInput: string;
  setNlpInput: Dispatch<SetStateAction<string>>;
  parsedResult: ParsedDateResult | null;
};
