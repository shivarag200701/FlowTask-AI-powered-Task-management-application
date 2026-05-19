import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import TaskBuilderProvider from "../task-builder-provider";
import type {
  CreateTodoWithDateTime,
  TodoWithCompleteAtDateTime,
} from "@/types";
import { useFormContext, type SubmitHandler } from "react-hook-form";
import { useUpdateTodo } from "@/hooks/use-todos";
import { SerializeFormData } from "@/utils/functions/serialize-form-data";
import type { UpdateTodo } from "@shiva200701/todotypes";
import { Popover } from "../ui/popover";
import PriorityDisplayer from "../pill-buttons/PriorityDisplay";
import PriorityDropDown from "../popovers/PriorityDropDown";
import { useDateTimeModal } from "./DateTimeModal";

type TodoFormValues = CreateTodoWithDateTime & { id?: string };

function TodoDetailForm({
  setShow,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    register,
    formState: { isValid, isDirty },
    handleSubmit,
    watch,
  } = useFormContext<TodoFormValues>();

  const { mutate: updateTodo } = useUpdateTodo();
  const todoId = watch("id");

  const { DateTimeButton, DateTimeModal } = useDateTimeModal();

  const [isPriorityDropDownOpen, setIsPriorityDropDownOpen] = useState(false);

  const onSubmit: SubmitHandler<TodoFormValues> = (data) => {
    const serialized = SerializeFormData(data);
    if (todoId) {
      updateTodo({ id: todoId, data: serialized as UpdateTodo });
    }
    setShow(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col sm:flex-row min-h-[200px]">
        {/* Left column - Title & Description */}
        <div className="flex-1 p-4 sm:border-r border-b sm:border-b-0 border-border/50">
          <input
            className="w-full border-none font-semibold text-base focus:outline-none"
            placeholder="Task name"
            {...register("title", { required: "title is required" })}
          />
          <textarea
            className="w-full border-none text-sm mt-2 focus:outline-none resize-none min-h-[120px] text-secondary-foreground"
            placeholder="Add a description..."
            {...register("description")}
          />
        </div>

        {/* Right column - Metadata */}
        <div className="w-full sm:w-[200px] p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Due Date
            </span>
            <DateTimeButton />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Priority
            </span>
            <Popover
              openPopover={isPriorityDropDownOpen}
              setOpenPopover={setIsPriorityDropDownOpen}
              content={
                <PriorityDropDown
                  onSelect={() => setIsPriorityDropDownOpen(false)}
                />
              }
            >
              <PriorityDisplayer />
            </Popover>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 p-3 flex justify-end gap-2">
        <Button
          variant="secondary"
          className="w-fit"
          Initial="Cancel"
          type="button"
          onClick={() => setShow(false)}
        />
        <Button
          variant="default"
          className="w-fit"
          disabled={!isValid || !isDirty}
          type="button"
          onClick={handleSubmit(onSubmit)}
        >
          Save
        </Button>
      </div>

      <DateTimeModal />
    </form>
  );
}

function TodoDetailModal({
  show,
  setShow,
  todo,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  todo: TodoWithCompleteAtDateTime;
}) {
  return (
    <Modal showModal={show} setShowModal={setShow} className="max-w-2xl">
      <TaskBuilderProvider todo={todo}>
        <TodoDetailForm setShow={setShow} />
      </TaskBuilderProvider>
    </Modal>
  );
}

export function useTodoDetailModal(todo: TodoWithCompleteAtDateTime) {
  const [show, setShow] = useState(false);

  const TodoDetailModalCallback = useCallback(() => {
    return <TodoDetailModal show={show} setShow={setShow} todo={todo} />;
  }, [show, setShow, todo]);

  return useMemo(
    () => ({
      TodoDetailModal: TodoDetailModalCallback,
      setShowTodoDetailModal: setShow,
    }),
    [TodoDetailModalCallback, setShow]
  );
}
