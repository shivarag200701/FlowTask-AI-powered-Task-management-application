import { useConfirmModal } from "@/components/modals/ConfirmModal";
import { useRemoveTeammateModal } from "@/components/modals/RemoveTeammateModal";
import { SearchBoxPersisted } from "@/components/SearchBox";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserProfile } from "@/hooks/use-users";
import {
  useRemoveMember,
  useRevokeInvite,
  useUpdateMember,
  useWorkspaceMembers,
} from "@/hooks/use-workspaces";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import type { WorkspaceDetail, WorkspaceMember } from "@/types";
import type { WorkspaceRoles } from "@shiva200701/todotypes";
import {
  Crown,
  MailX,
  MoreHorizontal,
  SendHorizonal,
  UserMinus,
  type LucideIcon,
} from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import WorkspaceMembersSkeleton from "./WorkspaceMembersSkeleton";

export function WorkspaceMembers() {
  const { workspace } = useOutletContext<{ workspace: WorkspaceDetail }>();
  const { data: userProfile } = useUserProfile();

  const [searchParams] = useSearchParams();

  const search = searchParams.get("search");

  const { data: WorkspaceMembers, isLoading } = useWorkspaceMembers({
    id: workspace.id,
    slug: workspace.slug,
    search: search ?? "",
  });

  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();
  const { mutate: revokeInviteMutation } = useRevokeInvite();

  const [selectedMemberRemove, setSelectedMemberRemove] = useState<{
    member: WorkspaceMember;
    isCurrentUser: boolean;
  } | null>(null);

  const [revokeInvite, setRevokeInvite] = useState<{ email: string } | null>(
    null
  );

  const { ConfirmModal, setShowConfirmModal } = useConfirmModal({
    title: "Revoke invite?",
    description: (
      <div>
        The invite sent to{" "}
        <span className="font-bold">{revokeInvite?.email}</span> will be
        revoked. You can always send a new invite later.
      </div>
    ),
    onConfirm: () => {
      if (!revokeInvite?.email) return;
      revokeInviteMutation(
        { workspaceId: workspace.id, email: revokeInvite.email },
        { onSuccess: () => setShowConfirmModal(false) }
      );
    },
    variant: "destructive",
  });

  const { RemoveTeamamteModal, setShowRemoveTeammateModal } =
    useRemoveTeammateModal({
      member: selectedMemberRemove?.member,
      isCurrentUser: selectedMemberRemove?.isCurrentUser ?? false,
      isLoading: isRemoving,
      onConfirm: () => {
        if (!selectedMemberRemove) return;
        removeMember(
          {
            workspaceId: workspace.id,
            memberId: selectedMemberRemove.member.id,
          },
          {
            onSuccess: () => {
              setShowRemoveTeammateModal(false);
              setSelectedMemberRemove(null);
            },
          }
        );
      },
    });

  const isOwner = workspace.currentUserRole === "owner";

  if (isLoading) {
    return <WorkspaceMembersSkeleton />;
  }

  return (
    <PageWidthWrapper className="max-w-7xl py-8 space-y-8 px-0 ">
      {/* Members */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Members
          </h3>
          <SearchBoxPersisted />
        </div>
        <div className="rounded-xl border border-border divide-y divide-border">
          {WorkspaceMembers?.members?.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isCurrentUser={member.user.id === userProfile?.id}
              isOwner={isOwner}
              onRemoveClick={(member, isCurrentUser) => {
                setSelectedMemberRemove({ member, isCurrentUser });
                setShowRemoveTeammateModal(true);
              }}
            />
          ))}
          {WorkspaceMembers?.invited?.map((invite) => (
            <InvitedRow
              key={invite.email}
              email={invite.email}
              createdAt={invite.createdAt}
              isOwner={isOwner}
              onRevokeClick={(email) => {
                setShowConfirmModal(true);
                setRevokeInvite({ email });
              }}
            />
          ))}
          {!WorkspaceMembers?.members?.length &&
            !WorkspaceMembers?.invited?.length && (
              <div className="h-[400px] w-full flex items-center justify-center text-neutral-500 text-sm">
                No members found.
              </div>
            )}
        </div>
      </div>
      <RemoveTeamamteModal />
      {ConfirmModal}
    </PageWidthWrapper>
  );
}

function MemberRow({
  member,
  isCurrentUser,
  isOwner,
  onRemoveClick,
}: {
  member: WorkspaceMember;
  isCurrentUser: boolean;
  isOwner: boolean;
  onRemoveClick: (member: WorkspaceMember, isCurrentUser: boolean) => void;
}) {
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar>
          <AvatarImage
            src={member.user.image || `https://avatar.vercel.sh/${member.id}`}
            alt={member.user.name ?? undefined}
            referrerPolicy="no-referrer"
          />
        </Avatar>
        <div>
          <p className="text-sm font-medium">
            {member.user.name}
            {isCurrentUser && (
              <span className="text-muted-foreground ml-1">(you)</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {member.user.email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-30 shrink-0">
        <StyledRoleSelector
          member={member}
          isCurrentUser={isCurrentUser}
          isOwner={isOwner}
        />
        {isOwner || isCurrentUser ? (
          <Popover
            openPopover={isMoreOptionsOpen}
            setOpenPopover={setIsMoreOptionsOpen}
            content={
              <MoreOptionsDropDown
                onClick={() => {
                  setIsMoreOptionsOpen(false);
                  onRemoveClick(member, isCurrentUser);
                }}
                text={
                  isCurrentUser ? "Leave workspace" : "Remove from workspace"
                }
                icon={UserMinus}
              />
            }
            side="bottom"
            align="end"
          >
            <Button
              variant="ghost"
              size="icon-sm"
              icon={<MoreHorizontal strokeWidth={1} className="h-5 w-5" />}
            />
          </Popover>
        ) : (
          <div className="w-8" />
        )}
      </div>
    </div>
  );
}

function InvitedRow({
  email,
  createdAt,
  isOwner,
  onRevokeClick,
}: {
  email: string;
  createdAt: string;
  isOwner: boolean;
  onRevokeClick: (email: string) => void;
}) {
  const invitedAgo = DateTime.fromISO(createdAt).toRelative();
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar>
          <AvatarImage
            src={`https://avatar.vercel.sh/${email}`}
            alt={email}
            referrerPolicy="no-referrer"
          />
        </Avatar>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{email}</p>
          <p className="text-xs text-muted-foreground truncate">
            Invited {invitedAgo}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-30 shrink-0">
        <div className="w-fit sm:w-[120px] inline-flex gap-1 items-center justify-center text-xs sm:text-sm rounded-full sm:rounded-md border-0 sm:border px-2.5 py-0.5 sm:px-3 sm:py-2 bg-blue-50 text-blue-600 border-blue-200">
          <SendHorizonal className="size-3" />
          <span>Invited</span>
        </div>
        {isOwner ? (
          <Popover
            openPopover={isMoreOptionsOpen}
            setOpenPopover={setIsMoreOptionsOpen}
            content={
              <MoreOptionsDropDown
                onClick={() => {
                  setIsMoreOptionsOpen(false);
                  onRevokeClick(email);
                }}
                text="Revoke Invite"
                icon={MailX}
              />
            }
            side="bottom"
            align="end"
          >
            <Button
              variant="ghost"
              size="icon-sm"
              icon={<MoreHorizontal strokeWidth={1} className="h-5 w-5" />}
            />
          </Popover>
        ) : (
          <div className="w-8" />
        )}
      </div>
    </div>
  );
}

function MoreOptionsDropDown({
  onClick,
  text,
  icon: Icon,
}: {
  onClick: () => void;
  text?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="p-1.5">
      <button
        className="text-red-500 flex gap-2 text-sm rounded-md hover:bg-red-100 cursor-pointer transition-all duration-200 p-1.5"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <Icon className="w-5 h-5" />
        <span>{text}</span>
      </button>
    </div>
  );
}

function StyledRoleSelector({
  member,
  isCurrentUser,
  isOwner,
}: {
  member: WorkspaceMember;
  isCurrentUser: boolean;
  isOwner: boolean;
}) {
  const { mutate } = useUpdateMember();

  const canChangeRole = isOwner && !isCurrentUser;
  const tooltipMessage = isCurrentUser
    ? "You cannot change your own role"
    : !isOwner
      ? "Only owners can change roles"
      : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Select
            value={member.role}
            onValueChange={(newRole) =>
              mutate({
                memberId: member.id,
                role: newRole as WorkspaceRoles,
                workspaceId: member.workspaceId,
              })
            }
            disabled={!canChangeRole}
          >
            <SelectTrigger
              className={`w-fit cursor-pointer hover:ring-3 ring-neutral-200 sm:w-[120px] inline-flex gap-1 text-xs sm:text-sm rounded-full sm:rounded-md border-0 sm:border px-2.5 py-0.5 sm:px-3 sm:py-2 [&>span:last-child]:hidden sm:[&>span:last-child]:inline ${member.role === "owner" ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-600"}`}
            >
              {member.role === "owner" && <Crown className="size-3" />}
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      {tooltipMessage && (
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          className="text-sm"
        >
          {tooltipMessage}
        </TooltipContent>
      )}
    </Tooltip>
  );
}
