import type { PropsWithChildren, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Grid } from "@/components/ui/grid";
import { Gradient } from "@/components/ui/gradient";
import LogoCard from "@/features/_legacy/LogoCard";
import SignedInHint from "@/features/auth/onboarding/SignedInHint";
import { cn } from "@/lib/utils";

type AuthLayoutProps = PropsWithChildren<{
  gridCellSize?: number;
  showBackButton?: boolean;
  backHref?: string;
  logo?: "logocard" | "none";
  logoSlot?: ReactNode;
  showLogoHalo?: boolean;
  showSignedInHint?: boolean;
  className?: string;
}>;

const AuthLayout = ({
  gridCellSize = 60,
  showBackButton = false,
  backHref = "/",
  logo = "logocard",
  logoSlot,
  showLogoHalo = true,
  showSignedInHint = false,
  className,
  children,
}: AuthLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-hidden bg-white">
      <div
        className={cn(
          "relative isolate min-h-screen text-white flex flex-col items-center justify-center px-4",
          className
        )}
      >
        {/* Grid background */}
        <div
          className={cn(
            "absolute inset-y-0 -z-10 left-1/2 w-full -translate-x-1/2 pointer-events-none",
            "mask-intersect mask-[linear-gradient(black,transparent_1000px),linear-gradient(90deg,transparent,black_5%,black_100%,transparent)]"
          )}
        >
          <Grid
            cellSize={gridCellSize}
            patternOffset={[0.75, 0]}
            className="text-neutral-200"
          />
        </div>

        {/* Back button */}
        {showBackButton && (
          <button
            onClick={() => navigate(backHref)}
            className="text-slate-600 hidden lg:block hover:text-slate-900 absolute z-10 top-10 left-10 gap-2 px-4 py-3 rounded-xl border border-slate-200/50 hover:border-slate-300/50 shadow-sm backdrop-blur-2xl cursor-pointer bg-white/10 hover:bg-white hover:shadow-md"
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <p className="font-medium">Back to home</p>
            </div>
          </button>
        )}

        {/* Logo section */}
        {logoSlot != null ? (
          logoSlot
        ) : logo === "logocard" ? (
          <div className="grow max-h-50 sm:max-h-75 pt-6 sm:pt-10 relative">
            {showLogoHalo && (
              <Gradient className="opacity-5 mix-blend-overlay" />
            )}
            <LogoCard className="z-10" />
            {showLogoHalo && (
              <Gradient className="opacity-10 mix-blend-hard-light" />
            )}
          </div>
        ) : null}

        {/* Content */}
        {children}

        {/* Signed-in hint */}
        {showSignedInHint && <SignedInHint />}
      </div>
    </div>
  );
};

export default AuthLayout;
