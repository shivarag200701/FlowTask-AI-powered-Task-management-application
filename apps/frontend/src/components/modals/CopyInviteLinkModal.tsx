import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Link } from "lucide-react";
import { CopyButton } from "../ui/copy-button";

export function CopyInviteLinkModal({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Modal showModal={show} setShowModal={setShow}>
      <div className="flex flex-col items-center justify-center space-y-4 border-b border-border">
        <div className="flex flex-col space-y-1 items-start justify-center p-2 sm:p-4 w-full">
          <h3 className="font-medium text-lg">Invite Link</h3>
          <p className="text-neutral-500 text-sm text-center">
            Allow other people to join your workspace through the link below.
          </p>
        </div>
      </div>
      <div className="bg-accent/50 flex flex-col gap-y-4 p-2 sm:px-4 items-center justify-center">
        <CopyButton value="https://app.dub.co/invites/qx5FULgZIsM6zcHcGoDE5vox" />
        <Button
          Initial="Reset invite link"
          variant="outline"
          size="lg"
          Loading="Reset invite link"
        />
      </div>
    </Modal>
  );
}

function CopyInviteLinkButton({
  setShow,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Button
      onClick={() => {
        setShow(true);
      }}
      variant="outline"
      size="sm"
    >
      <Link className="size-4" />
    </Button>
  );
}

export function useCopyInviteLinkModal() {
  const [show, setShow] = useState(false);

  const CopyInviteButtonCallback = useCallback(
    () => <CopyInviteLinkButton setShow={setShow} />,
    [setShow]
  );

  const CopyInviteModalCallback = useCallback(() => {
    return <CopyInviteLinkModal show={show} setShow={setShow} />;
  }, [show, setShow]);

  return useMemo(
    () => ({
      CopyInviteLinkButton: CopyInviteButtonCallback,
      CopyInviteLinkModal: CopyInviteModalCallback,
    }),
    [setShow, CopyInviteButtonCallback, CopyInviteModalCallback]
  );
}
