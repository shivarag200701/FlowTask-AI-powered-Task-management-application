import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Kbd } from "../ui/kbd";

export function InviteMemberModal({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Modal showModal={show} setShowModal={setShow}>
      <div className="flex flex-col items-center justify-center space-y-4 border-b border-border">
        <div className="flex flex-col space-y-1 items-center justify-center px-4 py-8 sm:px-16 sm:py-8 w-full">
          <h3 className="font-medium text-lg">Invite Link</h3>
          <p className="text-neutral-500 text-sm text-center">
            Allow other people to join your workspace through the link below.
          </p>
        </div>
      </div>
      <div className="bg-accent/50 flex flex-col gap-y-4 px-4 py-8 sm:px-16 sm:py-8 items-center justify-center">
        <div className="flex flex-col space-y-2"></div>
        <Button Initial="Reset invite link" Loading="Reset invite link" />
      </div>
    </Modal>
  );
}

function InviteMemberButton({
  setShow,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Button
      className="w-fit gap-1.5"
      onClick={() => {
        setShow(true);
      }}
      variant="outline"
      size="sm"
    >
      <span className="hidden sm:inline">Invite Member</span>
      <Kbd>M</Kbd>
    </Button>
  );
}

export function useInviteMemberModal() {
  const [show, setShow] = useState(false);

  const InviteMemberButtonCallback = useCallback(
    () => <InviteMemberButton setShow={setShow} />,
    [setShow]
  );

  const InviteMemberModalCallback = useCallback(() => {
    return <InviteMemberModal show={show} setShow={setShow} />;
  }, [show, setShow]);

  return useMemo(
    () => ({
      InviteMemberButton: InviteMemberButtonCallback,
      InviteMemberModal: InviteMemberModalCallback,
    }),
    [setShow, InviteMemberButtonCallback, InviteMemberModalCallback]
  );
}
