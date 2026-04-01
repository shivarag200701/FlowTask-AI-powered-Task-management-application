//for now reminder is simple , reminder is boolean is if true, then reminder is at the time of the task
//so in the reminder preset we fill it with if todo.reminder is true then atTimeOfTask
//
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AlarmClock, AlarmClockCheck, X } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";

interface ReminderPickerProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  className?: string;
  reminder: boolean;
  setReminder: (v: boolean) => void;
}

function ReminderPicker({
  open,
  setOpen,
  className,
  reminder,
  setReminder,
}: ReminderPickerProps) {
  const [draft, setDraft] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(reminder ? "atTimeOfTask" : "");
    setOpen(next);
  };

  return (
    <Popover
      openPopover={open}
      setOpenPopover={handleOpenChange}
      sideOffset={0}
      content={
        <div className={cn("flex flex-col gap-3 w-full p-3", className)}>
          <h2 className="text-md font-bold md:text-xs">Reminders</h2>
          <Tabs defaultValue="beforeTask">
            <TabsList className="rounded-2xl">
              <TabsTrigger
                className="rounded-2xl px-5 py-2.5"
                value="dateAndTime"
                disabled
              >
                Date And Time
              </TabsTrigger>
              <TabsTrigger
                className="rounded-2xl px-5 py-2.5"
                value="beforeTask"
              >
                Before Task
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dateAndTime" />
            <TabsContent value="beforeTask">
              <BeforeTask value={draft} onValueChange={setDraft} />
            </TabsContent>
          </Tabs>
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              className="rounded-sm text-xs"
              onClick={() => {
                setReminder(draft === "atTimeOfTask");
                setOpen(false);
              }}
            >
              Add Reminder
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex h-full w-fit cursor-pointer items-center gap-2 rounded-sm border border-border p-1 hover:bg-muted/50">
        <AlarmClock size={18} strokeWidth={1} />
        {reminder && (
          <>
            <span className="text-xs text-black">At time of Task</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setReminder(false);
              }}
            >
              <X
                strokeWidth={1}
                size={12}
                className="hover:bg-muted rounded-xs cursor-pointer"
                aria-label="Clear Reminder"
              />
            </button>
          </>
        )}
      </div>
    </Popover>
  );
}

function BeforeTask({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full cursor-pointer">
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {value ? (
            <AlarmClockCheck
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          ) : null}
          <SelectValue defaultValue={value} placeholder="At time of task" />
        </span>
      </SelectTrigger>
      <SelectContent position="popper" className="bg-task">
        <SelectItem value="atTimeOfTask">At time of task</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default ReminderPicker;
