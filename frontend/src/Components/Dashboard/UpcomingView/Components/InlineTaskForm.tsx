//todo-implement tags later for the whole application
import { cn } from "@/utils/cn";
import { useForm } from "react-hook-form";
import InputBox from "../../../InputBox";
import type { Todo } from "@/types";
import useInlineTask from "../hooks/use-inline-task";
import { Button } from "@/Components/ui/button";
import { SendHorizonal, X } from "lucide-react";
import PriorityPicker from "../../ui/PriorityPicker";
import ReminderPicker from "../../ui/ReminderPicker";

interface InlineTaskFormProps {
  className?: string;
  todo: Todo;
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
            <div className="w-full h-5 border border-border rounded-sm"></div>
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
            />
            <div className="w-[50%] h-5 border border-border rounded-sm"></div>
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
