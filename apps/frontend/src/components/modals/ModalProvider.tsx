import {
  createContext,
  useCallback,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDeleteModal } from "./DeleteModal";
import { useAddEditTagModal } from "./AddEditTagModal";
import { useSearchModal } from "./SearchModal";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { createSlug } from "@/utils/functions/slug";

type ModalContext = {
  setShowDeleteTodoModal: Dispatch<SetStateAction<boolean>>;
  setShowAddEditTagModal: Dispatch<SetStateAction<boolean>>;
  setShowSearchModal: Dispatch<SetStateAction<boolean>>;
  openTodoDetailModal: (todo: TodoWithCompleteAtDateTime) => void;
};

export const ModalContext = createContext<ModalContext>({
  setShowDeleteTodoModal: () => {},
  setShowAddEditTagModal: () => {},
  setShowSearchModal: () => {},
  openTodoDetailModal: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const { setShowDeleteTodoModal, DeleteTodoModal } = useDeleteModal();
  const { AddEditTagModal, setShowAddEditTagModal } = useAddEditTagModal();
  const { SearchModal, setShowSearchModal } = useSearchModal();
  const navigate = useNavigate();
  const location = useLocation();

  const openTodoDetailModal = useCallback(
    (todo: TodoWithCompleteAtDateTime) => {
      const slug = createSlug(todo.title, todo.id);
      navigate(`/app/task/${slug}`, {
        state: { backgroundLocation: location },
      });
    },
    [navigate, location]
  );

  return (
    <ModalContext.Provider
      value={{
        setShowDeleteTodoModal,
        setShowAddEditTagModal,
        setShowSearchModal,
        openTodoDetailModal,
      }}
    >
      <DeleteTodoModal />
      <AddEditTagModal />
      <SearchModal />
      {children}
    </ModalContext.Provider>
  );
}
