import { Calendar, Sun, CircleSlash2 } from "lucide-react";
import {
  addDays,
  formatIsoLocalDate,
  formatWeekdayShort,
  startOfDay,
} from "@/features/CustomDatePicker/utils";

export default function QuickActions({
  handleDateSelect,
}: {
  handleDateSelect: (date: string) => void;
}) {
  const today = startOfDay();
  const tomorrow = addDays(today, 1);

  const optionsMap = [
    {
      id: 1,
      icon: <Calendar className="w-4.5 h-4.5 text-neutral-800" />,
      text: "Today",
      dateStr: formatWeekdayShort(today),
      value: formatIsoLocalDate(today),
    },
    {
      id: 2,
      icon: <Sun className="w-4.5 h-4.5 text-orange-400" />,
      text: "Tomorrow",
      dateStr: formatWeekdayShort(tomorrow),
      value: formatIsoLocalDate(tomorrow),
    },
    {
      id: 3,
      icon: <CircleSlash2 className="w-4.5 h-4.5 text-neutral-800" />,
      text: "No date",
    },
  ];

  return (
    <div className="flex flex-col gap-1 border-b border-border p-1">
      {optionsMap.map((option) => (
        <button
          key={option.id}
          type="button"
          className="hover:bg-neutral-100 px-2 py-1 transition-all duration-100 cursor-pointer"
          onClick={() => {
            handleDateSelect(option.value ?? "");
          }}
        >
          <div className="flex justify-between">
            <div className="flex items-center justify-center gap-3">
              {option.icon}
              <p className="text-[13px]">{option.text}</p>
            </div>
            <div className="text-[13px] text-neutral-500 font-light">
              {option.dateStr}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
