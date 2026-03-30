import { useState } from "react";
import NLPDateParser from "./components/NLPDateParser";
import useNLPDate from "./hooks/use-nlp-date";
import type { CustomDatePickerProps } from "./types";
import QuickActions from "./components/QuickActions";
import { Calendar } from "../ui/calendar";

export default function CustomDatePicker({
  selectedDate,
  setS,
  selectedTime,
  onDateSelect,
  setIsRecurring,
  setRecurrencePattern,
}: CustomDatePickerProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReccurencePicker, setShowReccurencePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState();

  const { nlpInput, setNlpInput, parsedResult } = useNLPDate(300);
  const [date, setDate] = useState<Date>();

  const handleNLPApplyDate = () => {
    if (
      parsedResult &&
      parsedResult.confidence === "high" &&
      parsedResult.date
    ) {
      onDateSelect(parsedResult.date);
    }
  };

  return (
    <div className="bg-task md:border md:border-border rounded-md md:w-[230px] w-full transition-opacity duration-150 md:max-h-[600px] overflow-hidden">
      <NLPDateParser
        onApply={handleNLPApplyDate}
        nlpInput={nlpInput}
        setNlpInput={setNlpInput}
        parsedResult={parsedResult}
      />
      <QuickActions handleDateSelect={onDateSelect} />
      <Calendar mode="single" selected={date} onSelect={setDate} />
    </div>
  );
}
