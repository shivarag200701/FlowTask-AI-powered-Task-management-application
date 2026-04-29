import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { parseDateTime } from "@/utils/functions/parseDateTime";
import { DateTime } from "luxon";
import { formatDatetime } from "@/utils/functions/formate-datetime";
import AnimatedSizeContainer from "../ui/animated-size-container";

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
      console.log("nlp ", nlpInput);

      const result = parseDateTime(nlpInput);
      if (!result) return setParsedResult("");
      setParsedResult(formatDatetime(result.date, result.isAllDay));
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
      <AnimatedSizeContainer height>
        {parsedResult && parsedResult.length > 0 && (
          <div className="mt-3 text-xs flex items-center px-3">
            <div className="flex flex-col ">
              <div className="text-black text-[13px]">{parsedResult}</div>
              <div className="text-muted-foreground text-[10px]">
                Press enter to apply the Date and Time
              </div>
            </div>
          </div>
        )}
      </AnimatedSizeContainer>
    </div>
  );
}
