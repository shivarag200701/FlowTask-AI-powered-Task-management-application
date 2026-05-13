import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { parseDateTime } from "@/utils/functions/parseDateTime";
import { DateTime } from "luxon";
import { formatDatetime } from "@/utils/functions/formate-datetime";
import {
  displayHour12,
  meridiemFrom24,
  to24Hour,
  type Meridiem,
} from "@/utils/functions/twelve-hour-time";
import AnimatedSizeContainer from "../ui/animated-size-container";
import { Popover } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Calendar1 } from "lucide-react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Button } from "../ui/button";

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
  dueDate: DateTime | null;
  dueTime: DateTime | null;
  isAllDay: boolean;
};

export default function SmartDateTimePicker({
  onChange,
  label,
  value,
  dueDate,
  dueTime,
  isAllDay,
}: SmartDateTimePickerProps) {
  const [nlpInput, setNlpInput] = useState("");
  const [parsedResult, setParsedResult] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [calenderOpen, setCalenderOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [addTimeExpanded, setAddTimeExpanded] = useState(false);

  const showTimePicker = dueTime != null || addTimeExpanded;

  useEffect(() => {
    const id = setTimeout(() => {
      const result = parseDateTime(nlpInput);
      if (!result) return setParsedResult("");
      setParsedResult(formatDatetime(result.date, result.isAllDay));
    }, 300);

    return () => {
      clearTimeout(id);
    };
  }, [nlpInput, setNlpInput]);

  const id = useId();

  useEffect(() => {
    setDate(dueDate?.toJSDate());
  }, [dueDate]);

  const pickerBase = useMemo(() => {
    return (
      dueTime ??
      dueDate ??
      (date ? DateTime.fromJSDate(date) : null) ??
      DateTime.now()
    );
  }, [dueTime, dueDate, date]);

  const [meridiem, setMeridiem] = useState<Meridiem>(() =>
    meridiemFrom24(pickerBase),
  );

  useEffect(() => {
    if (dueTime) setMeridiem(meridiemFrom24(dueTime));
  }, [dueTime]);

  const hour12Selected = displayHour12(pickerBase);

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
              if (parsed.isAllDay) setAddTimeExpanded(false);
              onChange?.({ date: parsed.date, isAllDay: parsed.isAllDay });
              e.target.value = formatDatetime(parsed.date, parsed.isAllDay);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputRef.current) {
              e.preventDefault();
              const parsed = parseDateTime(inputRef.current.value);
              if (parsed) {
                if (parsed.isAllDay) setAddTimeExpanded(false);
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
        <Popover
          openPopover={calenderOpen}
          setOpenPopover={setCalenderOpen}
          content={
            <div className="flex flex-col gap-3 sm:gap-0 w-full sm:flex-row">
              <Calendar
                mode="single"
                className="w-full rounded-2xl"
                selected={date}
                onSelect={(date) => {
                  setDate(date);
                  if (date) {
                    setAddTimeExpanded(false);
                    onChange?.({
                      date: DateTime.fromJSDate(date),
                      isAllDay: true,
                    });
                    if (inputRef.current) {
                      inputRef.current.value = formatDatetime(
                        DateTime.fromJSDate(date),
                        true,
                      );
                    }
                  }
                }}
                captionLayout="label"
              />
              <div className="flex flex-col w-full sm:min-w-[200px] sm:border-l sm:border-border">
                <div className="flex gap-2 p-2 border-b border-border sm:flex-col sm:gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    variant={
                      isAllDay && dueTime == null && !addTimeExpanded
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      if (!onChange) return;
                      setAddTimeExpanded(false);
                      const day =
                        date != null
                          ? DateTime.fromJSDate(date).startOf("day")
                          : pickerBase.startOf("day");
                      onChange({ date: day, isAllDay: true });
                      if (inputRef.current) {
                        inputRef.current.value = formatDatetime(day, true);
                      }
                    }}
                  >
                    All day
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    variant={
                      dueTime != null || addTimeExpanded ? "default" : "outline"
                    }
                    onClick={() => setAddTimeExpanded(true)}
                  >
                    Add time
                  </Button>
                </div>
                {showTimePicker ? (
                  <div className="flex flex-col w-full sm:flex-row divide-y sm:divide-y-0 sm:divide-x sm:h-[300px]">
                    <ScrollArea className="sm:w-auto">
                      <div className="flex items-center justify-center sm:flex-col p-2">
                        {Array.from({ length: 12 }, (_, i) => i + 1)
                          .reverse()
                          .map((hour) => (
                            <Button
                              key={hour}
                              className="w-fit"
                              variant={
                                hour12Selected === hour ? "default" : "ghost"
                              }
                              onClick={() => {
                                if (!onChange) return;
                                const h24 = to24Hour(hour, meridiem);
                                const next = pickerBase.set({
                                  hour: h24,
                                  minute: pickerBase.minute,
                                  second: 0,
                                  millisecond: 0,
                                });
                                onChange({ date: next, isAllDay: false });
                                if (inputRef.current) {
                                  inputRef.current.value = formatDatetime(
                                    next,
                                    false,
                                  );
                                }
                              }}
                            >
                              {hour}
                            </Button>
                          ))}
                      </div>
                      <ScrollBar
                        orientation="horizontal"
                        className="sm:hidden"
                      />
                    </ScrollArea>
                    <ScrollArea className="sm:w-auto">
                      <div className="flex sm:flex-col p-2">
                        {Array.from({ length: 12 }, (_, i) => i * 5).map(
                          (minute) => (
                            <Button
                              key={minute}
                              className="w-fit"
                              variant={
                                pickerBase.minute === minute
                                  ? "default"
                                  : "ghost"
                              }
                              onClick={() => {
                                if (!onChange) return;
                                const next = pickerBase.set({
                                  minute,
                                  second: 0,
                                  millisecond: 0,
                                });
                                onChange({ date: next, isAllDay: false });
                                if (inputRef.current) {
                                  inputRef.current.value = formatDatetime(
                                    next,
                                    false,
                                  );
                                }
                              }}
                            >
                              {minute.toString().padStart(2, "0")}
                            </Button>
                          ),
                        )}
                      </div>
                      <ScrollBar
                        orientation="horizontal"
                        className="sm:hidden"
                      />
                    </ScrollArea>
                    <ScrollArea className="w-64 sm:w-auto">
                      <div className="flex sm:flex-col p-2">
                        {(["AM", "PM"] as const).map((ampm) => (
                          <Button
                            key={ampm}
                            className="w-fit"
                            variant={meridiem === ampm ? "default" : "ghost"}
                            onClick={() => {
                              if (!onChange) return;
                              setMeridiem(ampm);
                              const h24 = to24Hour(hour12Selected, ampm);
                              const next = pickerBase.set({
                                hour: h24,
                                minute: pickerBase.minute,
                                second: 0,
                                millisecond: 0,
                              });
                              onChange({ date: next, isAllDay: false });
                              if (inputRef.current) {
                                inputRef.current.value = formatDatetime(
                                  next,
                                  false,
                                );
                              }
                            }}
                          >
                            {ampm}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center  text-sm text-muted-foreground max-w-[220px] mx-auto sm:mx-0 sm:max-w-none">
                    No specific time. Use{" "}
                    <span className="font-medium text-foreground">
                      Add time
                    </span>{" "}
                    if you need one.
                  </div>
                )}
              </div>
            </div>
          }
        >
          <Calendar1 className="size-3.5 absolute right-2 top-1/2 -translate-y-1/2" />
        </Popover>
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
