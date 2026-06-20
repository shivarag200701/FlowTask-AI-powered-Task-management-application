import EmptyState from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useInviteWorkspaceCode } from "@/hooks/use-workspaces";
import AuthLayout from "@/layouts/AuthLayout";
import { INVITE_ERROR_MESSAGES } from "@/types";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Invite() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { mutate, status, error, data } = useInviteWorkspaceCode();
  const navigate = useNavigate();

  useEffect(() => {
    if (inviteCode) {
      mutate(inviteCode);
    }
  }, [mutate, inviteCode]);

  const errorMessage = error
    ? (INVITE_ERROR_MESSAGES[error.code] ?? INVITE_ERROR_MESSAGES.UNKNOWN)
    : null;

  return (
    <AuthLayout>
      <div className="relative z-10 w-full max-w-lg flex items-start grow">
        {status === "pending" ? (
          <div className="w-full sm:rounded-[28px] sm:border border-border sm:bg-white/90 backdrop-blur-2xl p-8 sm:p-10 sm:shadow-xl">
            <EmptyState
              icon={<Spinner className="text-neutral-600 size-6 w-full" />}
              title="Verifying Invite"
              description="FlowTask is verifying your invite link. This might take a few seconds..."
            />
          </div>
        ) : status === "success" && data?.workspace ? (
          <div className="w-full sm:rounded-[28px] sm:border border-border sm:bg-white/90 backdrop-blur-2xl p-8 sm:p-10 sm:shadow-xl flex flex-col items-center gap-6">
            <EmptyState
              icon={<Spinner className="text-neutral-600 size-6 w-full" />}
              title={`Joined ${data.workspace.name}!`}
              description={data.msg}
            />
            <Button
              variant="default"
              size="lg"
              Initial="Go to workspace"
              onClick={() =>
                navigate(`/app/workspace/${data.workspace.id}`)
              }
              className="max-w-xs"
            />
          </div>
        ) : status === "error" && errorMessage ? (
          <div className="w-full sm:rounded-[28px] sm:border border-border sm:bg-white/90 backdrop-blur-2xl p-8 sm:p-10 sm:shadow-xl flex flex-col items-center gap-6">
            <EmptyState
              icon={
                <errorMessage.icon className="text-neutral-600 size-6 w-full" />
              }
              title={errorMessage.title}
              description={errorMessage.description}
            />
            {error.code === "ALREADY_MEMBER" && error.workspace ? (
              <Button
                variant="default"
                size="lg"
                Initial="Go to workspace"
                onClick={() =>
                  navigate(`/app/workspace/${error.workspace!.id}`)
                }
                className="max-w-xs"
              />
            ) : (
              <Button
                variant="default"
                size="lg"
                Initial="Go to dashboard"
                onClick={() => navigate("/app/today")}
                className="max-w-xs"
              />
            )}
          </div>
        ) : null}
      </div>
    </AuthLayout>
  );
}

export default Invite;
