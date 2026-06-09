import { cn } from "@/lib/utils";
import { useId, useState } from "react";
import { Input } from "../ui/input";
import { Calendar1 } from "lucide-react";
import { Popover } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { DateTime } from "luxon";

function DateTimePicker({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (date: DateTime) => void;
  value: string;
}) {
  const id = useId();
  const [calenderOpen, setCalenderOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <div className={cn("flex flex-col gap-2")}>
      {label && (
        <label htmlFor={`${id}-datetime`} className="text-sm font-medium block">
          {label}
        </label>
      )}
      <div className="relative">
        <Input placeholder="Pick a date and time" value={value} />
        <Popover
          openPopover={calenderOpen}
          setOpenPopover={setCalenderOpen}
          content={
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                setDate(date);
                if (date) onChange(DateTime.fromJSDate(date));
              }}
              className="rounded-lg border"
              captionLayout="dropdown"
            />
          }
        >
          <Calendar1 className="size-3.5 absolute right-2 top-1/2 -translate-y-1/2" />
        </Popover>
      </div>
    </div>
  );
}

export default DateTimePicker;
