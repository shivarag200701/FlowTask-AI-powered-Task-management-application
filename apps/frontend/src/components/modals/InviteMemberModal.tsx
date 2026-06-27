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
import { Input } from "../ui/input";
import { CircleXIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { useFieldArray, useForm } from "react-hook-form";
import { useSendEmailInvite } from "@/hooks/use-workspaces";
import { useUserProfile } from "@/hooks/use-users";
import type { WorkspaceDetail } from "@/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { RoleSelector } from "@/features/workspace/components/RoleSelector";
import { useMediaQuery } from "@/hooks/use-media-query";

export type InviteForm = {
  invites: { email: string; role: string }[];
};

export function InviteMemberModal({
  show,
  setShow,
  workspaceId,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  workspaceId?: string;
}) {
  //   const [inputCount, setInputCount] = useState(1);
  const { control, register, handleSubmit } = useForm<InviteForm>({
    defaultValues: {
      invites: [{ email: "", role: "member" }],
    },
  });

  const { mutate: sendEmailInvite, isPending } = useSendEmailInvite();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invites",
  });

  function handleClick() {
    if (fields.length >= 3) {
      toast.error("Can't send more than 3 emails at once");
      return;
    }
    append({ email: "", role: "member" });
  }

  function onSubmit(data: InviteForm) {
    if (!workspaceId) return;
    const emails = data.invites.map((i) => i.email);
    const hasDuplicates = new Set(emails).size !== emails.length;
    if (hasDuplicates) {
      toast.error("Duplicate emails found");
      return;
    }
    sendEmailInvite({ data, workspaceId });
  }

  return (
    <Modal showModal={show} setShowModal={setShow}>
      <div className="flex flex-col items-center justify-center space-y-4 border-b border-border">
        <div className="flex flex-col space-y-1 items-start justify-center p-2 sm:p-4 w-full">
          <h3 className="font-medium text-xl">Invite Teammates</h3>
          <p className="text-neutral-500 text-sm text-start">
            {/* Need to implement tool tip for documentation site for more information*/}
            <span>
              Invite teamates with{" "}
              <a className="underline">different roles and permissions.</a>
            </span>
            <br />
            <span>Invitations will be valid for 14 days.</span>
          </p>
        </div>
      </div>
      <div className="bg-accent/50 flex flex-col gap-y-4 p-2  sm:p-4 items-center justify-center">
        <form
          className="flex flex-col space-y-6 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium">Email</p>
            {fields.map((field, index) => (
              <div className="flex gap-0" key={index}>
                <Input
                  key={field.id}
                  autoFocus
                  placeholder="member@email.com"
                  {...register(`invites.${index}.email` as const, {
                    required: "Email is required",
                  })}
                  className="rounded-r-none"
                />
                <RoleSelector
                  control={control}
                  name={`invites.${index}.role`}
                />
                {fields.length > 1 && (
                  <Button
                    variant="custom"
                    className="w-fit ml-2"
                    onClick={() => remove(index)}
                  >
                    <CircleXIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              className="w-fit py-2.5"
              size="sm"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <Plus className="w-4 h-4" />
              Add email
            </Button>
          </div>
          <Button
            size="lg"
            Initial="Send Invite"
            Loading="Send Invite"
            isSubmitting={isPending}
          />
        </form>
      </div>
    </Modal>
  );
}

function InviteMemberButton({
  setShow,
  workspace,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
  workspace?: WorkspaceDetail;
}) {
  const { data: userProfile } = useUserProfile();
  const role = useMemo(() => {
    const user = workspace?.members.find(
      (member) => member.userId === userProfile?.id
    );
    return user?.role;
  }, [workspace, userProfile]);

  const { isMobile } = useMediaQuery();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="w-fit gap-1.5"
          onClick={() => {
            setShow(true);
          }}
          variant="outline"
          size={isMobile ? "sm" : "lg"}
          disabled={role === "member"}
        >
          <span className="">Invite Member</span>
          {!isMobile && <Kbd>M</Kbd>}
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="center"
        sideOffset={5}
        hidden={role === "owner"}
      >
        <span className="text-sm">
          Only workspace owners can Invite members
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

export function useInviteMemberModal({
  workspace,
}: {
  workspace?: WorkspaceDetail;
}) {
  const [show, setShow] = useState(false);

  const InviteMemberButtonCallback = useCallback(
    () => <InviteMemberButton setShow={setShow} workspace={workspace} />,
    [setShow]
  );

  const InviteMemberModalCallback = useCallback(() => {
    return (
      <InviteMemberModal
        show={show}
        setShow={setShow}
        workspaceId={workspace?.id}
      />
    );
  }, [show, setShow, workspace]);

  return useMemo(
    () => ({
      InviteMemberButton: InviteMemberButtonCallback,
      InviteMemberModal: InviteMemberModalCallback,
    }),
    [setShow, InviteMemberButtonCallback, InviteMemberModalCallback]
  );
}
