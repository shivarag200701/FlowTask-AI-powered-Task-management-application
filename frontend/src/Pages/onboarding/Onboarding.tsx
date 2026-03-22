import { type PropsWithChildren } from "react";
import SignedInHint from "./SignedInHint";
import { Grid } from "@/Components/ui/grid";
import { cn } from "@/lib/utils";
import ProgressBar from "./ProgressBar";

const Onboarding = ({ children }: PropsWithChildren) => {
  return (
    <div className="">
      <ProgressBar />
      <div
        className={cn(
          "absolute inset-y-0 -z-30 left-1/2 w-full -translate-x-1/2",
          "mask-intersect mask-[linear-gradient(black,transparent_1000px),linear-gradient(90deg,transparent,black_5%,black_100%,transparent)]",
        )}
      >
        <Grid
          cellSize={10}
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
