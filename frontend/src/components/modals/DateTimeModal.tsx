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
import { CalendarClockIcon } from "lucide-react";
import { Kbd } from "../ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";
import NLPDateParser from "../custom-date-picker/components/NLPDateParser";
import { Calendar } from "../ui/calendar";

function DateTimeModal({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Modal setShowModal={setShow} showModal={show} className="max-w-md">
      <form className="px-4 py-5">
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
          <NLPDateParser />
          <Calendar />
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
  return (
    <Button
      variant="outline"
      className={cn("w-full md:w-fit text-sm h-10", className)}
      icon={<CalendarClockIcon />}
      type="button"
      onClick={() => {
        setShow(true);
      }}
    >
      Date <Kbd>D</Kbd>
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
