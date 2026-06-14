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
import type { DateTime } from "luxon";

function AddEditTodoModal({
  show,
  setShow,
  todo,
  sectionId,
  date,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  todo?: TodoWithCompleteAtDateTime;
  sectionId?: string;
  date?: DateTime;
}) {
  return (
    <Modal showModal={show} setShowModal={setShow} className="max-w-2xl">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClick={(e) => e.stopPropagation()}>
        <TaskBuilderProvider todo={todo} date={date}>
          <InlineTaskForm
            setIsOpen={setShow}
            mode="modal"
            sectionId={sectionId}
          />
        </TaskBuilderProvider>
      </div>
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
  date,
}: {
  todo?: TodoWithCompleteAtDateTime;
  sectionId?: string;
  date?: DateTime;
}) {
  const [show, setShow] = useState(false);

  const AddEditTodoModalCallback = useCallback(() => {
    return (
      <AddEditTodoModal
        show={show}
        setShow={setShow}
        todo={todo}
        sectionId={sectionId}
        date={date}
      />
    );
  }, [show, setShow, todo, date]);

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
