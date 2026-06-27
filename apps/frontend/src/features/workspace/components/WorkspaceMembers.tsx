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
import { useUpdateMember } from "@/hooks/use-workspaces";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import type { WorkspaceDetail, WorkspaceMember } from "@/types";
import type { WorkspaceRoles } from "@shiva200701/todotypes";
import { Crown, MoreHorizontal, UserMinus } from "lucide-react";
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

export function WorkspaceMembers() {
  const { workspace } = useOutletContext<{ workspace: WorkspaceDetail }>();
  const { data: userProfile } = useUserProfile();

  const isOwner = useMemo(() => {
    const user = workspace?.members.find(
      (member) => member.userId === userProfile?.id
    );
    return user?.role === "owner";
  }, [workspace, userProfile]);

  return (
    <PageWidthWrapper className="max-w-7xl py-8 space-y-8 px-0 ">
      {/* Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Members
          </h3>
        </div>
        <div className="rounded-lg border border-border divide-y divide-border">
          {workspace.members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isCurrentUser={member.user.id === userProfile?.id}
              isOwner={isOwner}
            />
          ))}
        </div>
      </div>
    </PageWidthWrapper>
  );
}

function MemberRow({
  member,
  isCurrentUser,
  isOwner,
}: {
  member: WorkspaceMember;
  isCurrentUser: boolean;
  isOwner: boolean;
}) {
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium">
          {member.user.name?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
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
        <Popover
          openPopover={isMoreOptionsOpen}
          setOpenPopover={setIsMoreOptionsOpen}
          content={<MoreOptionsDropDown />}
          side="bottom"
          align="end"
        >
          <Button
            variant="ghost"
            size="icon-sm"
            icon={<MoreHorizontal strokeWidth={1} className="h-5 w-5" />}
          ></Button>
        </Popover>
      </div>
    </div>
  );
}

function MoreOptionsDropDown() {
  return (
    <div className="p-1.5">
      <div className="text-red-500 flex gap-2 text-sm rounded-md hover:bg-red-100 cursor-pointer transition-all duration-200 p-1.5">
        <UserMinus className="w-5 h-5" />
        <span>Leave Workspace</span>
      </div>
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
