import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

function ScrollContainer({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <div className="relative">
      <div
        className={cn(
          "overflow-y-auto max-h-[400px] hover:scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scrollbar-none",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
export default ScrollContainer;
