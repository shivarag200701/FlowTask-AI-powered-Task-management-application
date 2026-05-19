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

  const {
    DateTimeButton,
    DateTimeModal,
    setShowDateTimeModal,
    showDateTimeModal,
  } = useDateTimeModal();

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
      <div className="flex flex-col sm:flex-row min-h-[240px]">
        {/* Left column - Title & Description */}
        <div className="flex-1 pt-5 px-5 pb-3 sm:border-r border-b sm:border-b-0 border-border/50">
          <input
            className="w-full border-none font-semibold text-lg focus:outline-none"
            placeholder="Task name"
            {...register("title", { required: "title is required" })}
          />
          <textarea
            className="w-full border-none text-sm mt-3 focus:outline-none resize-none min-h-[140px] text-secondary-foreground font-light leading-relaxed"
            placeholder="Add a description..."
            {...register("description")}
          />
        </div>

        {/* Right column - Metadata */}
        <div className="w-full sm:w-[220px] p-4 flex flex-col gap-5 bg-neutral-50 sm:rounded-tr-2xl">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Due Date
            </span>
            <DateTimeButton />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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
          onClick={(e) => {
            e.stopPropagation();
            setShow(false);
          }}
        />
        <Button
          variant="default"
          className="w-fit"
          disabled={!isValid || !isDirty}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSubmit(onSubmit)(e);
          }}
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
