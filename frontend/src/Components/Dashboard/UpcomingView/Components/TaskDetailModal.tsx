import { Modal } from "@/Components/ui/modal";
import { Popover } from "@/Components/ui/popover";
import type { Todo } from "@/types";
import { MoreHorizontal, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { useTaskDetail } from "../hooks/use-task-detail";

interface TaskDetailProps {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onToggleComplete: (todoId: string | number) => void;
  onDelete: (todoId: string | number) => void;
  handleDuplicate: (todo: Todo) => void;
  editAllowed?: boolean;
}

interface TaskDetailPopoverProps {
  openPopover: boolean;
  setOpenPopover: (openPopover: boolean) => void;
}

export interface TaskDetailInnerProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onToggleComplete: (todoId: string | number) => void;
  onDelete: (todoId: string | number) => void;
  handleDuplicate: (todo: Todo) => void;
}

export function TaskDetailModal({
  modalOpen,
  setModalOpen,
  todo,
  onEdit,
  onToggleComplete,
  onDelete,
  handleDuplicate,
}: TaskDetailProps) {
  const { title, description, setDescription, setTitle } = useTaskDetail({
    todo,
    onDelete,
    onEdit,
    handleDuplicate,
    onToggleComplete,
  });

  const { register, handleSubmit } = useForm({
    defaultValues: {
      title: todo.title,
      description: todo.description,
    },
  });
  return (
    <Modal
      showModal={modalOpen}
      setShowModal={setModalOpen}
      className="max-w-screen-lg"
    >
      <div className="flex flex-col">
        <div className="flex justify-between py-3 px-6">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-lg">FlowTask</h1>
            <div
              className="h-[50%] w-px shrink-0 bg-border hidden md:block"
              aria-hidden
            />
            <p className="text-gray-600 text-md">Task Detail</p>
          </div>
          <button
            className="group hidden p-2 rounded-md hover:bg-neutral-100 text-neutral-500 transition-all duration-75 md:block focus:outline-none active:bg-neutral-200 hover:cursor-pointer "
            onClick={() => {
              setModalOpen(false);
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form>
          <div className="grid md:grid-cols-[2fr_1fr] gap-y-6">
            <div className="no-scrollbar px-6">
              <div className="flex flex-col gap-6 py-4 min-h-full">
                <label>
                  <span className="text-black mb-2 block text-sm font-medium leading-none">
                    Task Title
                  </span>
                  <input
                    {...register("title", { required: true })}
                    className="w-full  border border-border text-2xl! font-bold p-2 rounded-md"
                  />
                </label>
                <label>
                  <span className="text-black mb-2 block text-sm font-medium leading-none">
                    Description
                  </span>
                  <textarea
                    {...register("description")}
                    className="w-full border border-border p-2 rounded-md"
                    rows={5}
                    placeholder="Add description"
                  />
                </label>
              </div>
            </div>
            <div className="scrollbar-hide md:overflow-auto md:pl-0 md:pr-4 relative m-3">
              <div className="absolute inset-0 bg-neutral-50 mask-b-from-5% mask-b-to-70% rounded-md border border-border" />
              <div className="p-4"></div>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function TaskDetailPopover({
  openPopover,
  setOpenPopover,
}: TaskDetailPopoverProps) {
  return (
    <Popover
      openPopover={openPopover}
      setOpenPopover={setOpenPopover}
      content={<div>This pop over is open</div>}
    >
      <button
        type="button"
        className={`text-muted-foreground ${openPopover ? "bg-secondary" : ""} hover:text-foreground p-1 rounded-sm hover:bg-secondary/10 transition-colors cursor-pointer group-hover:bg-white border group-hover:border-border duration-300`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        title="More options"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </Popover>
  );
}
