import {
  useCallback,
  useMemo,
  useRef,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Check, ChevronRight, Plus } from "lucide-react";
import TaskList from "../TaskList";
import type { ChildTodoWithDateTime } from "@/types";
import InlineTaskForm from "../InlineTaskForm";
import { cn } from "@/lib/utils";
import completed from "@/assets/completed.mp3";

type TodoFormValues = CreateTodoWithDateTime & { id?: string };

function TodoDetailForm({
  setShow,
  todo,
  onChildClick,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
  todo: TodoWithCompleteAtDateTime;
  onChildClick?: (child: ChildTodoWithDateTime) => void;
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
  const [addChildTask, setAddChildTask] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    undefined
  );

  const onSubmit: SubmitHandler<TodoFormValues> = (data) => {
    const serialized = SerializeFormData(data);
    if (todoId) {
      updateTodo({ id: todoId, data: serialized as UpdateTodo });
    }
    setShow(false);
  };

  const subTaskCompleted = useMemo(() => {
    return todo?.children?.filter((child) => child.completed).length;
  }, [todo]);

  const completedSubTasks = useMemo(() => {
    return todo?.children?.filter((child) => child.completed);
  }, [todo]);

  const notCompletedSubTasks = useMemo(() => {
    return todo?.children?.filter((child) => !child.completed);
  }, [todo]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col sm:flex-row min-h-[500px] overflow-y-auto sm:min-h-[700px]">
        {/* Left column - Title & Description */}
        <div className="flex-1 p-4 sm:border-r border-b sm:border-b-0 border-border/50 ">
          <div className="flex items-start gap-3">
            <button
              type="button"
              className={cn(
                "h-5 w-5 mt-1 shrink-0 border border-border/50 rounded-full bg-linear-to-t from-neutral-100 hover:bg-none hover:cursor-pointer hover:border-border hover:ring-3 hover:ring-border/30 flex items-center justify-center group/circle",
                todo.completed && "opacity-50"
              )}
              onClick={(e) => {
                e.stopPropagation();
                new Audio(completed).play();
                updateTodo({
                  id: todo.id,
                  data: { completed: !todo.completed },
                });
              }}
            >
              {todo.completed ? (
                <Check size={15} />
              ) : (
                <Check size={15} className="group-hover/circle:block hidden" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <input
                className={cn(
                  "w-full border-none font-semibold text-xl focus:outline-none",
                  todo.completed && "line-through"
                )}
                placeholder="Task name"
                {...register("title", {
                  required: "title is required",
                  disabled: !!todo.parentId && todo.completed,
                })}
              />
              {!todo.completed && (
                <textarea
                  className="w-full border-none text-sm mt-2 focus:outline-none resize-none min-h-[80px] text-secondary-foreground"
                  placeholder="Add a description..."
                  {...register("description", {
                    disabled: !!todo.parentId && todo.completed,
                  })}
                />
              )}
              {todo.children && todo.children.length > 0 ? (
                <Accordion
                  type="single"
                  collapsible
                  value={accordionValue}
                  onValueChange={setAccordionValue}
                >
                  <AccordionItem value="overdue">
                    <AccordionTrigger className="group relative border-b">
                      <div className="flex gap-2 items-center">
                        <ChevronRight
                          size={25}
                          className="group-data-[state=open]:rotate-90 hover:cursor-pointer p-1 hover:bg-accent rounded-md absolute top-4 -left-2"
                        />
                        <div className="flex items-center gap-1 justify-center">
                          <div className="font-medium ml-5">Sub-tasks</div>
                          <span className="text-xs text-neutral-500">{`${subTaskCompleted} / ${todo.children.length}`}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {notCompletedSubTasks?.map((child) => (
                        <TaskList
                          key={child.id}
                          todo={child}
                          compact={true}
                          onClick={() => onChildClick?.(child)}
                        />
                      ))}
                      {!addChildTask ? (
                        <Button
                          variant="ghost"
                          className="w-fit hover:bg-accent/50"
                          onClick={() => setAddChildTask(true)}
                        >
                          <Plus />
                          <span>Add a sub-task</span>
                        </Button>
                      ) : (
                        <TaskBuilderProvider>
                          <InlineTaskForm
                            setIsOpen={setAddChildTask}
                            parentId={todo.id}
                          />
                        </TaskBuilderProvider>
                      )}
                      {completedSubTasks?.map((child) => (
                        <TaskList
                          key={child.id}
                          todo={child}
                          compact
                          taskCompleted
                          onClick={() => onChildClick?.(child)}
                        />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <div className="pt-6">
                  {!addChildTask ? (
                    <Button
                      variant="ghost"
                      className="w-fit hover:bg-accent/50 max-sm:p-0"
                      onClick={() => setAddChildTask(true)}
                    >
                      <Plus />
                      <span>Add a sub-task</span>
                    </Button>
                  ) : (
                    <TaskBuilderProvider>
                      <InlineTaskForm
                        setIsOpen={setAddChildTask}
                        parentId={todo.id}
                      />
                    </TaskBuilderProvider>
                  )}
                </div>
              )}
            </div>
          </div>
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

export function TodoDetailModal({
  show,
  setShow,
  todo,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  todo: TodoWithCompleteAtDateTime;
}) {
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const activeChild = activeChildId
    ? (todo.children?.find((c) => c.id === activeChildId) ?? null)
    : null;
  const activeTodo = activeChild ?? todo;

  return (
    <Modal
      showModal={show}
      setShowModal={setShow}
      onClose={() => setActiveChildId(null)}
      className="max-w-5xl"
    >
      {activeChild && (
        <div className="pt-3 px-4">
          <Button
            variant="outline"
            className="w-fit rounded-sm shadow-none"
            onClick={() => setActiveChildId(null)}
          >
            <div className="flex gap-2 items-center">
              <div className="h-4 w-4 border rounded-full" />
              {todo.title}
            </div>
          </Button>
        </div>
      )}
      <TaskBuilderProvider key={activeTodo.id} todo={activeTodo}>
        <TodoDetailForm
          setShow={setShow}
          todo={activeTodo}
          onChildClick={(child) => setActiveChildId(child.id)}
        />
      </TaskBuilderProvider>
    </Modal>
  );
}

export function useTodoDetailModal(todo: TodoWithCompleteAtDateTime) {
  const [show, setShow] = useState(false);
  const todoRef = useRef(todo);
  todoRef.current = todo;

  const TodoDetailModalCallback = useCallback(() => {
    return (
      <TodoDetailModal show={show} setShow={setShow} todo={todoRef.current} />
    );
  }, [show]);

  return useMemo(
    () => ({
      TodoDetailModal: TodoDetailModalCallback,
      setShowTodoDetailModal: setShow,
    }),
    [TodoDetailModalCallback, setShow]
  );
}
