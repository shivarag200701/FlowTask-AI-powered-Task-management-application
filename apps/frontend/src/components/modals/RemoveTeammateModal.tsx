import type { WorkspaceMember } from "@/types";
import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Modal } from "../ui/modal";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

function RemoveTeamamteModal({
  member,
  show,
  setShow,
  isCurrentUser,
}: {
  member?: WorkspaceMember | null;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  isCurrentUser: boolean;
}) {
  if (!member) return;
  return (
    <Modal showModal={show} setShowModal={setShow}>
      <div className="p-4 flex  flex-col items-start justify-center gap-1 border-b border-border">
        <div className="text-lg font-semibold">
          {isCurrentUser ? "Leave Workspace" : "Remove Teammate"}
        </div>
        <div className="text-sm text-neutral-500">
          {isCurrentUser ? (
            <>
              You are about to leave this workspace. You will lose access to all
              its projects and data. Are you sure you want to continue?
            </>
          ) : (
            <>
              This will remove{" "}
              <span className="text-neutral-900 font-semibold">
                {member.user.name}{" "}
              </span>{" "}
              from your workspace. Are you sure you want to continue?
            </>
          )}
        </div>
      </div>
      <div className="bg-accent/50 flex flex-col gap-y-4 p-4 items-center justify-center w-full ">
        <div className="flex flex-col space-y-6 w-full">
          <div className="w-full rounded-md border border-border h-[60px] bg-white flex items-center p-4 gap-2">
            <Avatar size="lg">
              <AvatarImage
                src={
                  member.user.image || `https://avatar.vercel.sh/${member.id}`
                }
                alt={member.user.name ?? undefined}
                referrerPolicy="no-referrer"
              />
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{member.user.name}</span>
              <span className="text-xs text-neutral-500">
                {member.user.email}
              </span>
            </div>
          </div>
          <Button variant="destructive" size="lg">
            {isCurrentUser ? "Leave Workspace" : "Remove"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function useRemoveTeammateModal({
  member,
  isCurrentUser,
}: {
  member?: WorkspaceMember | null;
  isCurrentUser: boolean;
}) {
  const [show, setShow] = useState(false);
  const RemoveTeammateModalCallback = useCallback(() => {
    return (
      <RemoveTeamamteModal
        show={show}
        setShow={setShow}
        member={member}
        isCurrentUser={isCurrentUser}
      />
    );
  }, [show, setShow, member, isCurrentUser]);

  return useMemo(
    () => ({
      setShowRemoveTeammateModal: setShow,
      RemoveTeamamteModal: RemoveTeammateModalCallback,
    }),
    [setShow, RemoveTeammateModalCallback]
  );
}
