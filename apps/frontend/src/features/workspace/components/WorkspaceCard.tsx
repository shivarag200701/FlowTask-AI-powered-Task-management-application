import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/use-users";
import type { Workspace } from "@/types";
import pluralize from "@/utils/functions/pluralize";
import { Crown, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile();
  const isOwner = workspace.createdBy === userProfile?.id;

  return (
    <div
      className="flex justify-between items-center py-3 px-4 select-none cursor-pointer"
      onClick={() => {
        if (workspace.slug) {
          navigate(`/app/workspaces/${workspace.slug}`);
        }
      }}
    >
      <div className="flex gap-3 items-center min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Users className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium truncate">{workspace.name}</p>
            {isOwner && <Crown className="size-3 text-amber-500 shrink-0" />}
          </div>
        </div>
      </div>
      <div className="flex gap-4 items-center shrink-0">
        <Button
          variant="outline"
          Initial={`${workspace._count.members} ${pluralize("member", workspace._count.members)}`}
          size="sm"
          className="w-[100px] bg-accent/50"
          icon={<Users />}
        />
      </div>
    </div>
  );
}

export default WorkspaceCard;
