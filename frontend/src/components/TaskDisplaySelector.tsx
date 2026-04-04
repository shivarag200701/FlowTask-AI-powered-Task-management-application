import { useState } from "react";
import { Popover } from "./ui/popover";
import { Button } from "./ui/button";
import { useTaskDisplayContext } from "@/context/TaskDisplayContext";
import {
  Calendar,
  ChevronDown,
  Columns3,
  Rows3,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { outlinePopoverTriggerClasses } from "@/lib/constants";
import type { ViewMode } from "@/types";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";

function TaskDisplaySelector() {
  const [isopen, setIsOpen] = useState(false);
  return (
    <Popover
      openPopover={isopen}
      setOpenPopover={setIsOpen}
      content={<DisplaySettingsDropdown />}
      sideOffset={4}
      popoverContentClassName="shadow-md"
    >
      <Button
        variant="outline"
        className={cn(
          "p-2 flex items-center justify-center",
          outlinePopoverTriggerClasses,
        )}
      >
        <div className="flex w-full gap-2  items-center">
          <Settings2 />
          <p>Display</p>
          <ChevronDown
            className={cn("h-4 w-4 text-neutral-400 transition-transform")}
          />
        </div>
      </Button>
    </Popover>
  );
}

function DisplaySettingsDropdown() {
  const { viewMode, setViewMode } = useTaskDisplayContext();
  const {
    register,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      viewMode,
    },
  });
  console.log("is Dirty", isDirty);

  return (
    <form className="w-full divide-y divide-neutral-200">
      <div className="p-3 flex flex-col gap-1 border-b border-border w-full">
        <p className="font-semibold text-[13px]">Layout</p>
        <Tabs
          defaultValue={viewMode}
          className="w-full"
          onValueChange={(v) => setViewMode(v as ViewMode)}
          {...register("viewMode")}
        >
          <TabsList className="h-15! sm:w-70 w-full shadow-none!">
            <TabsTrigger value="list" className="flex flex-col">
              <Rows3 />
              List
            </TabsTrigger>
            <TabsTrigger value="board" className="flex flex-col">
              <Columns3 />
              Board
            </TabsTrigger>
            <TabsTrigger value="home" className="flex flex-col">
              <Calendar />
              Calendar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {isDirty && (
        <AnimatePresence initial={false}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-end gap-2 p-2">
              <Button
                className="h-8 w-auto px-2"
                variant="ghost"
                Initial="Reset to default"
              />
              <Button className="h-8 w-auto px-2" Initial="Set as default" />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </form>
  );
}
export default TaskDisplaySelector;
