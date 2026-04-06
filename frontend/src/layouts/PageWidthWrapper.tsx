import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

function PageWidthWrapper({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-screen-xl px-3 md:px-6", className)}
    >
      {children}
    </div>
  );
}

export default PageWidthWrapper;
