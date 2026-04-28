import * as chrono from "chrono-node";
import { useEffect, useState } from "react";
import { toLuxonDate } from "@/utils/functions/datetime";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { parseDateTime } from "@/utils/functions/parseDateTime";
import { DateTime } from "luxon";

type SmartDateTimePickerProps = {
  onChange?: ({
    date,
    isAllDay,
  }: {
    date: DateTime;
    isAllDay: boolean;
  }) => void;
};

export default function SmartDateTimePicker({
  onChange,
}: SmartDateTimePickerProps) {
  const [nlpInput, setNlpInput] = useState("");
  const [isDateTimeInputOpen, setIsDateTimeInputOpen] = useState(false);
  const [parsedResult, setParsedResult] = useState<
    chrono.en.ParsedResult[] | null
  >(null);
  useEffect(() => {
    const id = setTimeout(() => {
      const result = chrono.parse(nlpInput);
      if (result) {
        setParsedResult(result);
      }
    }, 300);

    return () => {
      clearTimeout(id);
    };
  }, [nlpInput, setNlpInput]);

  return (
    <div className={cn("")}>
      <div className="flex gap-2 items-center relative">
        <Input
          type="text"
          value={nlpInput}
          onChange={(e) => {
            setNlpInput(e.target.value);
          }}
          onBlur={(e) => {
            const parsed = parseDateTime(e.target.value);

            if (parsed) {
              onChange?.({ date: parsed.date, isAllDay: parsed.isAllDay });
              e.target.value = parsed.date.toLocaleString(
                DateTime.DATETIME_MED,
              );
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // onApply();
            }
          }}
          placeholder="Type a date"
          className="w-full text-base sm:text-lg text-foreground placeholder:text-secondary focus:outline-none focus:border-ring bg-transparent h-10 px-3"
        />
      </div>
      {parsedResult && parsedResult.length > 0 && (
        <div className="mt-3 text-xs flex items-center gap-3 px-3">
          <div>
            <div
              className="flex items-center gap-3 cursor-pointerx"
              // onClick={onApply}
            >
              <div className="text-black text-[13px] flex items-center gap-1">
                {toLuxonDate(parsedResult[0].start.date()).toFormat("DD")}
              </div>
            </div>
            <div className="text-muted-foreground mt-3 text-[10px] pb-2">
              You can also type in recurring dates like{" "}
              <span className="text-gray-300">
                every day, every 2 weeks, and every month.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
