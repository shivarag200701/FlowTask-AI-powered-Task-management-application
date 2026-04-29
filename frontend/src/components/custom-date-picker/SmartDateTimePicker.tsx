import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { parseDateTime } from "@/utils/functions/parseDateTime";
import { DateTime } from "luxon";
import { formatDatetime } from "@/utils/functions/formate-datetime";

type SmartDateTimePickerProps = {
  onChange?: ({
    date,
    isAllDay,
  }: {
    date: DateTime;
    isAllDay: boolean;
  }) => void;
  label?: string;
  value: string;
};

export default function SmartDateTimePicker({
  onChange,
  label,
  value,
}: SmartDateTimePickerProps) {
  const [nlpInput, setNlpInput] = useState("");
  const [parsedResult, setParsedResult] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      const result = parseDateTime(nlpInput);
      if (result) {
        setParsedResult(formatDatetime(result.date, result.isAllDay));
      }
    }, 300);

    return () => {
      clearTimeout(id);
    };
  }, [nlpInput, setNlpInput]);

  const id = useId();

  return (
    <div className={cn("flex flex-col gap-2")}>
      {label && (
        <label htmlFor={`${id}-datetime`} className="text-sm font-medium block">
          {label}
        </label>
      )}
      <div className="flex gap-2 items-center relative">
        <Input
          ref={inputRef}
          type="text"
          defaultValue={value}
          id={`${id}-datetime`}
          onChange={(e) => {
            setNlpInput(e.target.value);
          }}
          onBlur={(e) => {
            const parsed = parseDateTime(e.target.value);

            if (parsed) {
              onChange?.({ date: parsed.date, isAllDay: parsed.isAllDay });
              e.target.value = formatDatetime(parsed.date, parsed.isAllDay);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputRef.current) {
              console.log("here");

              e.preventDefault();
              const parsed = parseDateTime(inputRef.current.value);
              if (parsed) {
                onChange?.({ date: parsed.date, isAllDay: parsed.isAllDay });
                inputRef.current.value = formatDatetime(
                  parsed?.date,
                  parsed?.isAllDay,
                );
              }
            }
          }}
          placeholder='E.g. "tomorrow at 5pm" or in "in 2 hours" '
          className="w-full text-base sm:text-lg text-foreground  focus:outline-none focus:border-ring bg-transparent h-10 px-3 "
        />
      </div>
      {parsedResult && (
        <div className="mt-3 text-xs flex items-center gap-3 px-3">
          <div>
            <div
              className="flex items-center gap-3 cursor-pointerx"
              // onClick={onApply}
            >
              <div className="text-black text-[13px] flex items-center gap-1">
                {parsedResult}
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
