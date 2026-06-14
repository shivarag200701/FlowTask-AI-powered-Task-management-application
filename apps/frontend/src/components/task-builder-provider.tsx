import type { TodoWithCompleteAtDateTime } from "@/types";
import { DEFAULT_TODO_PROPS } from "@/utils/constants/misc";
import type { PropsWithChildren } from "react";
import { useForm, FormProvider } from "react-hook-form";
import type { DateTime } from "luxon";

function TaskBuilderProvider({
  children,
  todo,
  date,
}: PropsWithChildren<{ todo?: TodoWithCompleteAtDateTime; date?: DateTime }>) {
  const form = useForm({
    defaultValues: todo || { ...DEFAULT_TODO_PROPS, ...(date && { dueDate: date }) },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}
export default TaskBuilderProvider;
