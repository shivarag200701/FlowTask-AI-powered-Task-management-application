import { type PropsWithChildren } from "react";
import SignedInHint from "@/pages/onboarding/SignedInHint";
import { Grid } from "@/components/ui/grid";
import { cn } from "@/lib/utils";

const Onboarding = ({
  className,
  children,
  cellSize = 10,
}: { className?: string; cellSize?: number } & PropsWithChildren) => {
  return (
    <div className="">
      <div
        className={cn(
          "absolute inset-y-0 -z-30 left-1/2 w-full -translate-x-1/2",
          "mask-intersect mask-[linear-gradient(black,transparent_1000px),linear-gradient(90deg,transparent,black_5%,black_100%,transparent)]",
          className,
        )}
      >
        <Grid
          cellSize={cellSize}
          patternOffset={[0.75, 0]}
          className="text-neutral-200"
        />
      </div>
      {children}
      <SignedInHint />
    </div>
  );
};

export default Onboarding;
