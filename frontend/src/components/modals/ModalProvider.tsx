import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useDeleteModal } from "./DeleteModal";
import { useAddEditTagModal } from "./AddEditTagModal";

type ModalContext = {
  setShowDeleteTodoModal: Dispatch<SetStateAction<boolean>>;
  setShowAddEditTagModal: Dispatch<SetStateAction<boolean>>;
};

export const ModalContext = createContext<ModalContext>({
  setShowDeleteTodoModal: () => {},
  setShowAddEditTagModal: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const { setShowDeleteTodoModal, DeleteTodoModal } = useDeleteModal();
  const { AddEditTagModal, setShowAddEditTagModal } = useAddEditTagModal();

  return (
    <ModalContext.Provider
      value={{ setShowDeleteTodoModal, setShowAddEditTagModal }}
    >
      <DeleteTodoModal />
      <AddEditTagModal />
      {children}
    </ModalContext.Provider>
  );
}
