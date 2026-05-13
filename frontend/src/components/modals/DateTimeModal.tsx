//Currently the date time is directly applied to the parent InlineForm, maybe in future we need to maintain a local form state and then sync it with the parent useFormContext, save just closes the form currently

import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CalendarClockIcon, X } from "lucide-react";
import { Kbd } from "../ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import SmartDateTimePicker from "../custom-date-picker/SmartDateTimePicker";
import { useForm, useFormContext } from "react-hook-form";
import type { CreateTodoWithDateTime } from "@/types";
import { formatDatetime } from "@/utils/functions/formate-datetime";
import { useTaskDisplayContext } from "@/context/TaskDisplayContext";

function DateTimeModal({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    watch: watchParent,
    getValues: getValuesParent,
    setValue: setValuesParent,
  } = useFormContext<CreateTodoWithDateTime>();

  const {
    setValue,
    formState: { isDirty },
    watch,
    handleSubmit,
  } = useForm<Pick<CreateTodoWithDateTime, "dueDate" | "dueTime" | "isAllDay">>(
    {
      values: {
        dueDate: getValuesParent("dueDate"),
        dueTime: getValuesParent("dueTime"),
        isAllDay: getValuesParent("isAllDay"),
      },
    },
  );

  const [dueDate, isAllDay, dueTime] = watch([
    "dueDate",
    "isAllDay",
    "dueTime",
  ]);
  const dueDateAtParent = watchParent("dueDate");

  return (
    <Modal setShowModal={setShow} showModal={show} className="max-w-md">
      <form
        className="px-4 py-5"
        onSubmit={(e) => {
          e.stopPropagation();
          handleSubmit((data) => {
            setValuesParent("dueDate", data.dueDate, { shouldDirty: true });
            setValuesParent("dueTime", null, { shouldDirty: true });
            setValuesParent("isAllDay", isAllDay, { shouldDirty: true });
            if (!data.isAllDay) {
              setValuesParent("dueTime", data.dueTime, { shouldDirty: true });
            }
            setShow(false);
          })(e);
        }}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-medium">Select Date and Time</h3>
          <Tooltip>
            <TooltipTrigger>
              <Kbd className="flex font-sans text-xs size-6 border-md border border-border">
                D
              </Kbd>
            </TooltipTrigger>
            <TooltipContent className="rounded-xl" side="right" sideOffset={8}>
              Press <span className="font-semibold">D</span> to open this
              quickly
            </TooltipContent>
          </Tooltip>
        </div>
        {/* Date Picker */}
        <div className="mt-6">
          <SmartDateTimePicker
            value={formatDatetime(dueDate, isAllDay)}
            onChange={({ date, isAllDay }) => {
              setValue("dueDate", date, { shouldDirty: true });
              setValue("dueTime", null, { shouldDirty: true });
              setValue("isAllDay", isAllDay, { shouldDirty: true });

              if (!isAllDay) {
                setValue("dueTime", date, { shouldDirty: true });
              }
            }}
            label="Type a date"
            dueDate={dueDate}
            dueTime={dueTime}
            isAllDay={isAllDay ?? true}
          />
        </div>
        <div className="flex w-full justify-between items-center h-full mt-4">
          <div>
            {!!dueDateAtParent && (
              <button
                className="text-xs cursor-pointer font-medium text-neutral-700 transition-colors hover:text-neutral-950"
                onClick={() => {
                  setValuesParent("dueDate", null, { shouldDirty: true });
                  setValuesParent("dueTime", null, { shouldDirty: true });
                  setValuesParent("isAllDay", true, { shouldDirty: true });
                  setShow(false);
                }}
              >
                Remove Date
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              className="w-fit"
              onClick={() => {
                setShow(false);
              }}
            >
              Cancel
            </Button>
            <Button className="w-fit" disabled={!isDirty}>
              {dueDateAtParent ? "Save" : "Add date"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function DateTimeButton({
  setShow,
  className,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
  className?: string;
}) {
  const { watch, setValue } = useFormContext<CreateTodoWithDateTime>();
  const date = watch("dueDate");
  const dateTime = watch("dueTime");

  const { viewMode } = useTaskDisplayContext();

  return (
    <Button
      variant="outline"
      className={cn("w-full md:w-fit text-xs h-8", className)}
      icon={<CalendarClockIcon />}
      type="button"
      onClick={() => {
        setShow(true);
      }}
    >
      {dateTime
        ? dateTime.toFormat("MMMM d h" + " " + "a")
        : date
          ? date.toFormat("MMMM dd")
          : viewMode !== "board"
            ? "Date"
            : ""}
      {date && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setValue("dueDate", null, { shouldDirty: true });
            setValue("dueTime", null, { shouldDirty: true });
            setValue("isAllDay", true, { shouldDirty: true });
          }}
          className="cursor-pointer"
        >
          <X className="hover:bg-neutral-200 rounded-sm size-3.5" />
        </button>
      )}
      {viewMode !== "board" ? <Kbd>D</Kbd> : ""}
    </Button>
  );
}

export function useDateTimeModal() {
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);

  const DateTimeModalCallback = useCallback(() => {
    return (
      <DateTimeModal show={showDateTimeModal} setShow={setShowDateTimeModal} />
    );
  }, [showDateTimeModal, setShowDateTimeModal]);

  const DateTimeButtonCallback = useCallback(() => {
    return <DateTimeButton setShow={setShowDateTimeModal} />;
  }, [setShowDateTimeModal]);

  return useMemo(
    () => ({
      DateTimeModal: DateTimeModalCallback,
      DateTimeButton: DateTimeButtonCallback,
      setShowDateTimeModal,
      showDateTimeModal,
    }),
    [DateTimeModalCallback, DateTimeButtonCallback],
  );
}
