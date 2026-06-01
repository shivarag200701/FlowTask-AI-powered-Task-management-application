import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import InlineTaskForm from "../InlineTaskForm";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Kbd } from "../ui/kbd";
import { useHotkeys } from "react-hotkeys-hook";
import TaskBuilderProvider from "../task-builder-provider";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { cn } from "@/lib/utils";

function AddEditTodoModal({
  show,
  setShow,
  todo,
  sectionId,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  todo?: TodoWithCompleteAtDateTime;
  sectionId?: string;
}) {
  return (
    <Modal showModal={show} setShowModal={setShow} className="max-w-2xl">
      <TaskBuilderProvider todo={todo}>
        <InlineTaskForm
          setIsOpen={setShow}
          mode="modal"
          sectionId={sectionId}
        />
      </TaskBuilderProvider>
    </Modal>
  );
}

function CreateTodoButton({
  setShow,
  buttonPresent,
  className,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
  buttonPresent?: boolean;
  className?: string;
}) {
  useHotkeys("c", () => {
    setShow(true);
  });
  return (
    <Button
      Initial="Create Task"
      onClick={() => {
        setShow(true);
      }}
      className={cn(className)}
    >
      {buttonPresent && <Kbd>C</Kbd>}
    </Button>
  );
}

export function useAddEditTodoModal({
  todo,
  sectionId,
}: {
  todo?: TodoWithCompleteAtDateTime;
  sectionId?: string;
}) {
  const [show, setShow] = useState(false);

  const AddEditTodoModalCallback = useCallback(() => {
    return (
      <AddEditTodoModal
        show={show}
        setShow={setShow}
        todo={todo}
        sectionId={sectionId}
      />
    );
  }, [show, setShow, todo]);

  const CreateTodoButtonCallback = useCallback(() => {
    return <CreateTodoButton setShow={setShow} />;
  }, [setShow]);

  return useMemo(
    () => ({
      AddEditTodoModal: AddEditTodoModalCallback,
      CreateTodoButton: CreateTodoButtonCallback,
      setShowAddEditTodoModal: setShow,
    }),
    [AddEditTodoModalCallback, CreateTodoButtonCallback, setShow]
  );
}
