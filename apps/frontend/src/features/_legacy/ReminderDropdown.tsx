import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClockPlus } from "lucide-react";

interface ReminderDropdownProps {
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  setReminder: (reminder: boolean) => void;
  isAllDay: boolean;
}

interface WarningPopUpProps {
  onClose: () => void;
}

const ReminderDropdown = ({
  buttonRef,
  onClose,
  setReminder,
  isAllDay,
}: ReminderDropdownProps) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [warningOpen, setWarningOpen] = useState(false);

  const getInitialPosition = () => {
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top + rect.height,
      };
    }
    return { left: 0, top: 0 };
  };
  const [position, setPosition] = useState(getInitialPosition);
  useEffect(() => {
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        left: rect.left,
        top: rect.top + rect.height,
      });
    }
  }, [buttonRef]);

  return createPortal(
    <>
      <div className="fixed inset-0 z-80" onClick={onClose} />
      <div
        ref={pickerRef}
        className="fixed bg-card border border-border rounded-md shadow-2xl z-90 w-[290px]"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
        }}
      >
        <div className="p-4">
          <div className="text-foreground font-semibold pb-4">Reminders</div>
          <div className="p-1 border border-border rounded-sm">
            <div className="flex gap-2">
              <div className="flex items-center justify-center">
                <ClockPlus size={18} />
              </div>
              <div>At time of task</div>
            </div>
          </div>
          <div className="text-xs mt-4 font-light text-muted-foreground">
            Get a notification when it’s time for this task.
          </div>
          <div className="flex justify-end mt-4">
            <button
              className="py-2 px-3 bg-accent rounded-sm text-white cursor-pointer text-xs"
              onClick={() => {
                if (isAllDay) {
                  setWarningOpen(true);
                  return;
                }
                setReminder(true);
                onClose();
              }}
            >
              Add Reminder
            </button>
          </div>
        </div>
        {warningOpen && (
          <WarningPopUp onClose={() => setWarningOpen(!warningOpen)} />
        )}
      </div>
    </>,
    document.body
  );
};

const WarningPopUp = ({ onClose }: WarningPopUpProps) => {
  return (
    <>
      <div
        className="fixed inset-0 z-80 opacity-50 bg-black"
        onClick={onClose}
      />
      <div className="fixed top-20 inset-x-1/2 -translate-x-1/2 text-foreground z-90 p-4 bg-card border border-border rounded-md shadow-2xl w-[420px]">
        <h1 className="text-[16px] font-semibold text-foreground mb-1">
          Set a time and date first
        </h1>
        <p className="text-muted-foreground text-[12px]/5 mb-8">
          You need to set a time for the task to be able to set a reminder for
          it. Schedule your task first, then come back to set a reminder.
        </p>
        <div className="w-full flex justify-end">
          <button
            className="text-[13px] px-3 py-1.5 bg-red-500 font-medium rounded-sm text-white cursor-pointer hover:bg-red-400"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
};

export default ReminderDropdown;
