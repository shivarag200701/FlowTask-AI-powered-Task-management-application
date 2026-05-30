import type {
  CreateTodoWithDateTime,
  TodoWithCompleteAtDateTime,
} from "@/types";
import { useFormContext, type SubmitHandler } from "react-hook-form";
import { Button } from "./ui/button";
import { Popover } from "./ui/popover";
import { useState, type Dispatch, type SetStateAction } from "react";
import PriorityDisplayer from "@/components/pill-buttons/PriorityDisplay";
import ReminderDisplayer from "@/components/pill-buttons/ReminderDisplayer";
import TagsSelector from "@/components/pill-buttons/TagsSelector";
import { useHotkeys } from "react-hotkeys-hook";
import PriorityDropDown from "./popovers/PriorityDropDown";
import { useCreateTodo, useUpdateTodo } from "@/hooks/use-todos";
import { useDateTimeModal } from "./modals/DateTimeModal";
import { SerializeFormData } from "@/utils/functions/serialize-form-data";
import type { UpdateTodo } from "@shiva200701/todotypes";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

type TodoFormValues = CreateTodoWithDateTime & { id?: string };

function InlineTaskForm({
  todo,
  setIsOpen,
  mode = "default",
  parentId,
  projectId,
}: {
  todo?: TodoWithCompleteAtDateTime;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  mode?: "default" | "modal";
  parentId?: string;
  projectId?: string;
}) {
  const {
    register,
    formState: { isValid, isDirty },
    handleSubmit,
    reset,
    watch,
  } = useFormContext<TodoFormValues>();

  const { mutate: createTodo } = useCreateTodo(projectId);
  const { mutate: updateTodo } = useUpdateTodo(projectId);
  const todoId = watch("id");

  const isEdit = Boolean(todoId);

  const {
    DateTimeButton,
    DateTimeModal,
    setShowDateTimeModal,
    showDateTimeModal,
  } = useDateTimeModal();

  useHotkeys(
    "t",
    () => {
      setIsTagsDropDownOpen(true);
    },
    { preventDefault: true, enabled: !showDateTimeModal }
  );

  const { isMobile } = useMediaQuery();

  useHotkeys(
    "d",
    () => {
      setShowDateTimeModal(true);
    },
    { preventDefault: true }
  );

  const [isPriorityDropDownOpen, setIsPriorityDropDownOpen] = useState(false);
  const [isReminderDropDownOpen, setIsReminderDropDownOpen] = useState(false);
  const [isTagsDropDownOpen, setIsTagsDropDownOpen] = useState(false);

  const onSubmit: SubmitHandler<TodoFormValues> = (data) => {
    const serialized = SerializeFormData(data);
    if (isEdit && todoId) {
      updateTodo({ id: todoId, data: serialized as UpdateTodo });
    } else {
      createTodo({ ...SerializeFormData(data), parentId, projectId });
    }
    reset();
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        "rounded-lg min-h-15",
        mode === "modal" && "rounded-2xl",
        !isMobile ? "border border-border" : ""
      )}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border-b border-border/50  px-3 py-2 w-full">
          <input
            className="w-full border-none font-semibold text-base focus:outline-none md:text-sm"
            placeholder="Task name"
            {...register("title", {
              required: "title is required",
            })}
          />
          <input
            className="w-full border-none text-base focus:outline-none md:text-sm"
            placeholder="Description"
            {...register("description")}
          />
          <div className="grid grid-cols-2 md:flex gap-2 mt-4">
            <DateTimeButton />
            <Popover
              openPopover={isPriorityDropDownOpen}
              setOpenPopover={setIsPriorityDropDownOpen}
              content={<PriorityDropDown />}
            >
              <PriorityDisplayer />
            </Popover>
            <Popover
              openPopover={isReminderDropDownOpen}
              setOpenPopover={setIsReminderDropDownOpen}
              content={<div>Reminder</div>}
            >
              <ReminderDisplayer remimder={todo?.reminder} />
            </Popover>
            <div className="col-span-2 w-full">
              <TagsSelector
                open={isTagsDropDownOpen}
                setOpen={setIsTagsDropDownOpen}
              />
            </div>
          </div>
        </div>
        <div className="w-full p-3 flex justify-end gap-2">
          <Button
            variant="secondary"
            className="w-fit"
            Initial="Cancel"
            onClick={() => {
              setIsOpen(false);
            }}
            type="button"
          />
          <Button
            variant="default"
            className="w-fit"
            disabled={!isValid || !isDirty}
            type="button"
            onClick={handleSubmit(onSubmit)}
          >
            {isEdit ? "Update Task" : "Add Task"}
          </Button>
        </div>
      </form>
      <DateTimeModal />
    </div>
  );
}
export default InlineTaskForm;
