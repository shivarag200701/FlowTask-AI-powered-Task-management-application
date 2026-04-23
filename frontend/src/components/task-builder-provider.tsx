import type { Todo } from "@/types";
import { DEFAULT_TODO_PROPS } from "@/utils/constants/misc";
import type { PropsWithChildren } from "react";
import { useForm, FormProvider } from "react-hook-form";

function TaskBuilderProvider({
  children,
  ...rest
}: PropsWithChildren<{ todo?: Todo }>) {
  const form = useForm({
    defaultValues: rest || { ...DEFAULT_TODO_PROPS },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}
export default TaskBuilderProvider;
