import EmptyState from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useInviteWorkspaceCode } from "@/hooks/use-workspaces";
import AuthLayout from "@/layouts/AuthLayout";
import { INVITE_ERROR_MESSAGES } from "@/types";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Invite() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { mutate, status, error } = useInviteWorkspaceCode();
  const navigate = useNavigate();

  useEffect(() => {
    if (inviteCode) {
      mutate(inviteCode, {
        onSuccess: (data) => {
          navigate(`/app/workspaces/${data.slug}`);
        },
      });
    }
  }, [mutate, inviteCode, navigate]);

  const errorMessage = error
    ? (INVITE_ERROR_MESSAGES[error.code] ?? INVITE_ERROR_MESSAGES.UNKNOWN)
    : null;
  return (
    <AuthLayout>
      <div className="relative z-10 w-full max-w-lg flex items-start grow">
        {status === "pending" ? (
          <EmptyState
            icon={<Spinner className="text-neutral-600 size-6 w-full" />}
            title="Verifying Invite"
            description="FlowTask is verifying your invite link. This might take a few seconds..."
          />
        ) : status === "error" && errorMessage ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <EmptyState
              icon={
                <errorMessage.icon className="text-neutral-600 size-6 w-full" />
              }
              title={errorMessage.title}
              description={errorMessage.description}
            />
            {error?.code === "ALREADY_MEMBER" && error.slug && (
              <Button
                variant="default"
                size="lg"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/app/workspaces/${error.slug}`);
                }}
              >
                Go to workspace
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </AuthLayout>
  );
}

export default Invite;
