//todo:- check later to persist the changesd when the tab is closed
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
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import api from "@/utils/functions/api";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { userPreferenceKeys } from "@/query-keys";
import type { UserPreference } from "@/api/user";

function TaskDisplaySelector({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const { isDirty } = useTaskDisplayContext();

  return (
    <Popover
      openPopover={isOpen}
      setOpenPopover={setIsOpen}
      content={<DisplaySettingsDropdown />}
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

function DisplaySettingsDropdown() {
  const { viewMode, isDirty, setViewMode, persisted } = useTaskDisplayContext();

  const { reset, control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      viewMode: viewMode,
    },
  });

  const queryClient = useQueryClient();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await api.put("/api/v1/user/user-preferences", {
        taskDisplayPreferences: { viewMode: data.viewMode },
      });
      reset({ viewMode: data.viewMode });
      queryClient.setQueryData<UserPreference>(
        userPreferenceKeys.preferences,
        (oldData) => ({
          ...oldData,
          taskDisplayPreferences: { viewMode: data.viewMode },
        })
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        const data = error.response?.data;
        toast.error(data.msg);
      }
    }
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
