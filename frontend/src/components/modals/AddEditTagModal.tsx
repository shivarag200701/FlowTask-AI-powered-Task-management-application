import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Kbd } from "../ui/kbd";
import { useHotkeys } from "react-hotkeys-hook";

function AddEditTagModal({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Modal showModal={show} setShowModal={setShow}>
      this is a modal
    </Modal>
  );
}

function CreateTagButton({
  setShow,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  useHotkeys("c", () => {
    setShow(true);
  });
  return (
    <Button
      Initial="Create tag"
      onClick={() => {
        setShow(true);
      }}
      className="hover:ring-4 hover:ring-border/70 hover:text-accent"
    >
      <Kbd>C</Kbd>
    </Button>
  );
}

export function useAddEditTagModal() {
  const [show, setShow] = useState(false);
  console.log("show", show);

  const AddEditTagModalCallback = useCallback(() => {
    return <AddEditTagModal show={show} setShow={setShow} />;
  }, [show, setShow]);

  const CreateTagButtonCallback = useCallback(() => {
    return <CreateTagButton setShow={setShow} />;
  }, [setShow]);

  return useMemo(
    () => ({
      setShowAddEditTagModal: setShow,
      AddEditTagModal: AddEditTagModalCallback,
      CreateTagButton: CreateTagButtonCallback,
    }),
    [setShow, AddEditTagModalCallback, CreateTagButtonCallback],
  );
}

export default AddEditTagModal;
