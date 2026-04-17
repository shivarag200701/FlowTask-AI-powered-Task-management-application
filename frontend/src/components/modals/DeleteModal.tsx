//This is a mockup global modal used as a reference , can be deleted later when mock up is not needed
import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Modal } from "../ui/modal";

function DeleteModal({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Modal showModal={show} setShowModal={setShow}>
      Hi there fools
    </Modal>
  );
}

export function useDeleteModal() {
  const [show, setShow] = useState(false);

  const DeleteModalCallback = useCallback(() => {
    return <DeleteModal show={show} setShow={setShow} />;
  }, [show, setShow]);

  return useMemo(
    () => ({
      setShowDeleteTodoModal: setShow,
      DeleteTodoModal: DeleteModalCallback,
    }),
    [setShow, DeleteModalCallback],
  );
}
