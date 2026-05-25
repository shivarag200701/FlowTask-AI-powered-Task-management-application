import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useDeleteModal } from "./DeleteModal";
import { useAddEditTagModal } from "./AddEditTagModal";
import { useSearchModal } from "./SearchModal";

type ModalContext = {
  setShowDeleteTodoModal: Dispatch<SetStateAction<boolean>>;
  setShowAddEditTagModal: Dispatch<SetStateAction<boolean>>;
  setShowSearchModal: Dispatch<SetStateAction<boolean>>;
};

export const ModalContext = createContext<ModalContext>({
  setShowDeleteTodoModal: () => {},
  setShowAddEditTagModal: () => {},
  setShowSearchModal: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const { setShowDeleteTodoModal, DeleteTodoModal } = useDeleteModal();
  const { AddEditTagModal, setShowAddEditTagModal } = useAddEditTagModal();
  const { SearchModal, setShowSearchModal } = useSearchModal();

  return (
    <ModalContext.Provider
      value={{
        setShowDeleteTodoModal,
        setShowAddEditTagModal,
        setShowSearchModal,
      }}
    >
      <DeleteTodoModal />
      <AddEditTagModal />
      <SearchModal />
      {children}
    </ModalContext.Provider>
  );
}
