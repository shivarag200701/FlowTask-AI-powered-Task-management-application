import { Modal } from "@/Components/ui/modal";
import type { Todo } from "@/types";
import type { Dispatch, SetStateAction } from "react";

interface TaskDetailProps {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  todo: Todo;
}

export function TaskDetailDialog({
  modalOpen,
  setModalOpen,
  todo,
}: TaskDetailProps) {
  return (
    <Modal showModal={modalOpen} setShowModal={setModalOpen}>
      <div>Hi there fool</div>
    </Modal>
  );
}
