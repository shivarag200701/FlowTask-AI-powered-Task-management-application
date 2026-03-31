//for now reminder is simple , reminder is boolean is if true, then reminder is at the time of the task
//so in the reminder preset we fill it with if todo.reminder is true then atTimeOfTask
//
import { Button } from "@/Components/ui/button";
import { Popover } from "@/Components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { AlarmClock } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";

interface ReminderPickerProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  className?: string;
  reminder: boolean;
}

function ReminderPicker({
  open,
  setOpen,
  className,
  reminder,
}: ReminderPickerProps) {
  const [reminderPreset, setReminderPreset] = useState<string>(() => {
    if (reminder) {
      return "atTimeOfTask";
    }
    return "";
  });
  return (
    <Popover
      openPopover={open}
      setOpenPopover={setOpen}
      sideOffset={0}
      content={
        <div className="p-3 flex flex-col gap-3 w-full">
          <h2 className="text-md md:text-xs font-bold">Reminders</h2>
          <Tabs defaultValue="beforeTask">
            <TabsList className="rounded-2xl">
              <TabsTrigger
                className="rounded-2xl px-5 py-2.5"
                value="dateAndTime"
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
            <TabsContent value="dateAndTime"></TabsContent>
            <TabsContent value="beforeTask">
              <BeforeTask
                value={reminderPreset}
                onValueChange={setReminderPreset}
              />
            </TabsContent>
          </Tabs>
          <div className="flex justify-end">
            <Button size="sm" className="text-xs rounded-sm">
              Add Reminder
            </Button>
          </div>
        </div>
      }
    >
      <button className="w-fit h-full border border-border rounded-sm p-1 flex gap-2 items-center hover:bg-muted/50 cursor-pointer">
        <AlarmClock size={18} strokeWidth={1} />
      </button>
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
        <SelectValue defaultValue="atTimeOfTask" />
      </SelectTrigger>
      <SelectContent position="popper" className="bg-task">
        <SelectItem value="atTimeOfTask">At time of task</SelectItem>
      </SelectContent>
    </Select>
  );
}

//Todo Date time reminder for pro users

export default ReminderPicker;
