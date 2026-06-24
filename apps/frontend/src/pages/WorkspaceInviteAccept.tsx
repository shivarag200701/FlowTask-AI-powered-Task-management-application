import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { isAxiosError } from "axios";
import { CheckCircle2, Shield, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import AuthLayout from "@/layouts/AuthLayout";
import { useInvitePreview } from "@/hooks/use-workspaces";
import type { InvitePreview } from "@/types";

type ViewState = "loading" | "preview" | "accepting" | "accepted" | "error";

function WorkspaceInviteAccept() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const { mutate } = useInvitePreview();

  const [view, setView] = useState<ViewState>("loading");
  const [data, setData] = useState<InvitePreview | null>(null);
  const [error, setError] = useState<{
    title: string;
    description: string | null;
  } | null>(null);

  useEffect(() => {
    if (!token || !email) {
      setView("error");
      return;
    }

    setView("loading");
    mutate(
      { token, email },
      {
        onSuccess: (response) => {
          setData(response);
          setView("preview");
        },
        onError: (err) => {
          if (isAxiosError<{ msg: string; description?: string }>(err)) {
            setError({
              title: err.response?.data.msg ?? "Invalid invite",
              description: err.response?.data.description ?? null,
            });
          } else {
            setError({
              title: "Something went wrong",
              description:
                "Unable to verify the invite. Please try again later.",
            });
          }
          setView("error");
        },
      }
    );
  }, []);

  const handleAccept = async () => {
    setView("accepting");
    // TODO: call accept endpoint
    await new Promise((r) => setTimeout(r, 1500));
    setView("accepted");
    setTimeout(() => navigate(`/app/workspaces/${data?.workspace.slug}`), 2000);
  };

  const handleDecline = () => {
    navigate("/app/today");
  };

  const initial = data?.workspace.name.charAt(0).toUpperCase();

  return (
    <AuthLayout showBackButton backHref="/app/today">
      <div className="relative z-10 w-full max-w-lg grow flex items-start justify-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full sm:rounded-[28px] sm:border border-border sm:bg-white/90 backdrop-blur-2xl p-6 sm:p-10 sm:shadow-xl"
        >
          {/* Loading */}
          {view === "loading" && (
            <div className="flex flex-col items-center gap-4 py-12">
              <Spinner className="text-neutral-600 size-6" />
              <p className="text-sm text-neutral-500 font-medium">
                Verifying invite...
              </p>
            </div>
          )}

          {/* Preview */}
          {view === "preview" && data && (
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                {data.workspace.icon ? (
                  <img
                    src={data.workspace.icon}
                    alt={data.workspace.name}
                    className="size-16 rounded-2xl object-cover ring-1 ring-neutral-200"
                  />
                ) : (
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-600 flex items-center justify-center text-white text-2xl font-semibold ring-1 ring-neutral-200">
                    {initial}
                  </div>
                )}
              </div>

              <div className="text-center space-y-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                  Join {data.workspace.name}
                </h1>
                <p className="text-sm text-neutral-500">
                  You've been invited to collaborate
                </p>
              </div>

              <div className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    Role
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Shield className="size-3.5 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-800">
                      {data.role}
                    </span>
                  </div>
                </div>
                <div className="border-t border-neutral-200" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    Members
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-800">
                      {data.workspace.memberCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAccept}
                  Initial="Accept Invite"
                  Loading="Accept Invite"
                />
                <button
                  onClick={handleDecline}
                  className="w-full text-center text-sm text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                >
                  Decline
                </button>
              </div>

              <p className="text-xs text-neutral-400 text-center">
                This invite was sent to{" "}
                <span className="font-medium text-neutral-500">
                  {data.email}
                </span>
              </p>
            </div>
          )}

          {/* Accepting */}
          {view === "accepting" && (
            <div className="flex flex-col items-center gap-4 py-12">
              <Spinner className="text-neutral-600 size-6" />
              <p className="text-sm text-neutral-500 font-medium">
                Joining {data?.workspace.name}...
              </p>
            </div>
          )}

          {/* Accepted */}
          {view === "accepted" && (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="size-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="size-6 text-emerald-500" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-semibold text-slate-900">
                  You're in!
                </p>
                <p className="text-sm text-neutral-500">
                  Redirecting to {data?.workspace.name}...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {view === "error" && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="size-12 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="size-6 text-red-500" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-semibold text-slate-900">
                  {error?.title ?? "Invalid invite"}
                </p>
                {error?.description && (
                  <p className="text-sm text-neutral-500 max-w-xs">
                    {error.description}
                  </p>
                )}
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/app/today")}
                Initial="Go to dashboard"
                Loading="Go to dashboard"
              />
            </div>
          )}
        </motion.div>
      </div>
    </AuthLayout>
  );
}

export default WorkspaceInviteAccept;
