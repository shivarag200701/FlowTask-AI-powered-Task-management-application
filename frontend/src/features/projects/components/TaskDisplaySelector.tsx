//todo:- check later to persist the changesd when the tab is closed
import { useState, type Dispatch, type SetStateAction } from "react";
import { Popover } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronDown,
  Columns3,
  Rows3,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { outlinePopoverTriggerClasses } from "@/lib/constants";
import type { ViewMode } from "@/types";
import { AnimatePresence, motion } from "motion/react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { useUpdateProject } from "@/hooks/use-projects";

type TaskDisplaySelector = {
  className?: string;
  isDirty: boolean;
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  persisted: ViewMode;
  id: string;
};

function TaskDisplaySelector({
  className,
  isDirty,
  viewMode,
  setViewMode,
  persisted,
  id,
}: TaskDisplaySelector) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      openPopover={isOpen}
      setOpenPopover={setIsOpen}
      content={
        <DisplaySettingsDropdown
          isDirty={isDirty}
          viewMode={viewMode}
          setViewMode={setViewMode}
          persisted={persisted}
          id={id}
        />
      }
      sideOffset={4}
      popoverContentClassName="shadow-md"
    >
      <Button
        variant="outline"
        className={cn(
          "p-2 flex items-center justify-center",
          className,
          outlinePopoverTriggerClasses
        )}
      >
        <div className="flex w-full gap-2  items-center relative">
          <div className="relative shrink-0">
            <Settings2 />
            {isDirty && (
              <div className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-blue-500">
                <div className="h-full w-full animate-pulse rounded-full ring-2 ring-blue-500/40" />
              </div>
            )}
          </div>
          Display
          <ChevronDown
            className={cn("h-4 w-4 text-neutral-400 transition-transform", {
              "rotate-180": isOpen,
            })}
          />
        </div>
      </Button>
    </Popover>
  );
}

type FormValues = {
  viewMode: ViewMode;
};

function DisplaySettingsDropdown({
  isDirty,
  viewMode,
  setViewMode,
  persisted,
  id,
}: TaskDisplaySelector) {
  const { reset, control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      viewMode: viewMode,
    },
  });

  const { mutate } = useUpdateProject(id);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    mutate({
      id,
      data: { taskDisplayPreferences: { viewMode: data.viewMode } },
    });
  };

  return (
    <form className="w-full divide-y divide-neutral-200">
      <div className="p-3 flex flex-col gap-1 border-b border-border w-full">
        <p className="font-semibold text-[13px]">Layout</p>
        <Controller
          name="viewMode"
          control={control}
          render={({ field }) => (
            <Tabs
              className="w-full"
              onValueChange={(v) => {
                field.onChange(v); // reset({ viewMode: v as ViewMode });
                setViewMode(v as ViewMode);
              }}
              value={field.value}
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
                <TabsTrigger value="calendar" className="flex flex-col">
                  <Calendar />
                  Calendar
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        />
      </div>
      <AnimatePresence initial={false}>
        {isDirty && (
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
                type="button"
                onClick={() => {
                  reset({ viewMode: persisted });
                  setViewMode(persisted);
                }}
              />
              <Button
                type="submit"
                className="h-8 w-auto px-2"
                Initial="Set as default"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(onSubmit)();
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
export default TaskDisplaySelector;
