import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useDeleteModal } from "./DeleteModal";

type ModalContext = {
  setShowDeleteTodoModal: Dispatch<SetStateAction<boolean>>;
};

export const ModalContext = createContext<ModalContext>({
  setShowDeleteTodoModal: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const { setShowDeleteTodoModal, DeleteTodoModal } = useDeleteModal();

  return (
    <ModalContext.Provider value={{ setShowDeleteTodoModal }}>
      <DeleteTodoModal />
      {children}
    </ModalContext.Provider>
  );
}
