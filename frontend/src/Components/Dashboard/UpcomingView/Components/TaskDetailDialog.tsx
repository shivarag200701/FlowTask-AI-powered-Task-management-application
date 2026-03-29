import TaskDetailDrawer from "@/Components/TaskDetailDrawer";
import { Modal } from "@/Components/ui/modal";
import type { Todo } from "@/types";
import type { Dispatch, SetStateAction } from "react";

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

export function TaskDetailModal({
  modalOpen,
  setModalOpen,
  todo,
  onEdit,
  onToggleComplete,
  onDelete,
  handleDuplicate,
}: TaskDetailProps) {
  return (
    <Modal
      showModal={modalOpen}
      setShowModal={setModalOpen}
      className="max-w-screen-lg"
    >
      <TaskDetailDrawer
        todo={todo}
        onEdit={onEdit}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        handleDuplicate={handleDuplicate}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </Modal>
  );
}
