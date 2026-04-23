//todo-implement tags later for the whole application
import { cn } from "@/utils/functions/cn";
import { useForm } from "react-hook-form";
import InputBox from "@/features/InputBox";
import type { Todo } from "@/types";
import useInlineTask from "@/features/dashboard/UpcomingView/hooks/use-inline-task";
import { Button } from "@/components/ui/button";
import { SendHorizonal, X } from "lucide-react";
import PriorityPicker from "@/features/dashboard/ui/PriorityPicker";
import ReminderPicker from "@/features/dashboard/ui/ReminderPicker";
import CustomDatePicker from "@/features/CustomDatePicker/CustomDatePicker";

interface InlineTaskFormProps {
  className?: string;
  todo?: Todo;
}

function InlineTaskForm({ className, todo }: InlineTaskFormProps) {
  const {
    title,
    description,
    setTitle,
    setDescription,
    priority,
    setPriority,
    isPriorityOpen,
    setIsPriorityOpen,
    isReminderOpen,
    setIsReminderOpen,
    reminder,
    setReminder,
    isDateOpen,
    setIsDateOpen,
    date,
    setDate,
  } = useInlineTask(todo);
  const {} = useForm();
  return (
    <div
      className={cn(
        "px-2 py-3 backdrop-blur-sm border border-border-hover rounded-md bg-transparent w-full min-w-0 overflow-hidden",
        className,
      )}
    >
      <form>
        <div className="flex flex-col gap-2 relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-foreground placeholder:text-[#A2A2A9] text-base md:text-sm outline-none focus:outline-none min-w-0 font-semibold"
            placeholder="Title"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent text-foreground placeholder:text-[#A2A2A9] text-base md:text-sm outline-none focus:outline-none min-w-0"
            placeholder="Description"
          />
          <div className="flex gap-2">
            <CustomDatePicker open={isDateOpen} setOpen={setIsDateOpen} />
            <PriorityPicker
              open={isPriorityOpen}
              setOpen={setIsPriorityOpen}
              priority={priority}
              onPriorityChange={(priority) => {
                setPriority(priority);
                setIsPriorityOpen(false);
              }}
            />
            <ReminderPicker
              open={isReminderOpen}
              setOpen={setIsReminderOpen}
              reminder={reminder ?? false}
              setReminder={setReminder}
            />
          </div>
          <div className="h-px bg-border/70  -mx-2" />
          <div className="flex justify-end">
            <div className="flex gap-2">
              <Button
                className="aspect-square rounded-sm p-0"
                size="icon-sm"
                variant="secondary"
              >
                <X className="size-7" strokeWidth={1} />
              </Button>
              <Button className="aspect-square rounded-sm" size="icon-sm">
                <SendHorizonal />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default InlineTaskForm;
