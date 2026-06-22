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
import { useInviteCodeReset } from "@/hooks/use-workspaces";
import type { WorkspaceDetail } from "@/types";
import { useUserProfile } from "@/hooks/use-users";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function CopyInviteLinkModal({
  show,
  setShow,
  workspace,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  workspace?: WorkspaceDetail;
}) {
  const { mutate, isPending } = useInviteCodeReset({
    workspaceId: workspace?.id!,
    slug: workspace?.slug!,
  });

  const { data: userProfile } = useUserProfile();

  const role = useMemo(() => {
    const user = workspace?.members.find(
      (member) => member.user.id === userProfile?.id
    );
    return user?.role;
  }, [workspace, userProfile]);

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
        <CopyButton
          value={`${import.meta.env.VITE_APP_DOMAIN}/app/invites/${workspace?.inviteCode}`}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              Initial="Reset invite link"
              variant="outline"
              size="lg"
              Loading="Reset invite link"
              onClick={(e) => {
                e.stopPropagation();
                mutate();
              }}
              disabled={role === "member"}
              isSubmitting={isPending}
            />
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="center"
            sideOffset={5}
            hidden={role === "owner"}
          >
            <span className="text-sm">
              Only workspace owners can reset the invite link
            </span>
          </TooltipContent>
        </Tooltip>
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

export function useCopyInviteLinkModal({
  workspace,
}: {
  workspace?: WorkspaceDetail;
}) {
  const [show, setShow] = useState(false);

  const CopyInviteButtonCallback = useCallback(
    () => <CopyInviteLinkButton setShow={setShow} />,
    [setShow]
  );

  const CopyInviteModalCallback = useCallback(() => {
    return (
      <CopyInviteLinkModal
        show={show}
        setShow={setShow}
        workspace={workspace}
      />
    );
  }, [show, setShow, workspace]);

  return useMemo(
    () => ({
      CopyInviteLinkButton: CopyInviteButtonCallback,
      CopyInviteLinkModal: CopyInviteModalCallback,
    }),
    [setShow, CopyInviteButtonCallback, CopyInviteModalCallback]
  );
}
