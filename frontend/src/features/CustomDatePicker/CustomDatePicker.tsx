import { useState } from "react";
import NLPDateParser from "./components/NLPDateParser";
import type { CustomDatePickerProps } from "./types";
import QuickActions from "./components/QuickActions";
import { Calendar } from "../ui/calendar";
import { Popover } from "../ui/popover";
import { CalendarClockIcon } from "lucide-react";
import { DateTime } from "luxon";

export default function CustomDatePicker({
  open,
  setOpen,
}: CustomDatePickerProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReccurencePicker, setShowReccurencePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>();

  //   const today = new Date();
  //   const handleNLPApplyDate = () => {
  //     if (
  //       parsedResult &&
  //       parsedResult.confidence === "high" &&
  //       parsedResult.date
  //     ) {
  //       onDateSelect(parsedResult.date);
  //     }
  //   };
  //   const date = new Date(selectedDate);
  return (
    <Popover
      openPopover={open}
      setOpenPopover={setOpen}
      content={<div>Open </div>}
      sideOffset={0}
    >
      <div className="flex h-full w-fit cursor-pointer items-center gap-2 rounded-sm border border-border p-1 hover:bg-muted/50">
        <CalendarClockIcon size={18} strokeWidth={1} />
      </div>
    </Popover>
  );
}

function DatePickerInner() {
  return (
    <div className="bg-task md:border md:border-border rounded-md md:w-[230px] w-full transition-opacity duration-150 md:max-h-[600px] overflow-hidden">
      <NLPDateParser />
      <QuickActions handleDateSelect={onDateSelect} />
      <Calendar
        mode="single"
        selected={date}
        onSelect={onDateSelect}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        startMonth={today}
        navLayout="after"
        numberOfMonths={12}
        classNames={{
          months: "relative flex w-full flex-col gap-4",
          today: "[&_button]:font-semibold",
        }}
        disabled={{ before: new Date() }}
        className="max-h-[260px] overflow-y-auto no-scrollbar"
      />
    </div>
  );
}
