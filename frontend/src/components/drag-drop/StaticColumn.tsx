import { cn } from "@/lib/utils";
import { useScrollBoundary } from "@/utils/functions/use-scroll-boundary";
import type { ReactNode } from "react";

function StaticColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { atBottom, atTop, handleScroll } = useScrollBoundary();
  return (
    <div className="min-w-[290px] h-full max-h-[calc(100vh-200px)] duration-200 transition-all flex flex-col gap-1.5 items-center text-sm font-semibold p-2">
      <div className="text-left w-full">
        <span>{title}</span>
      </div>
      <div
        className={cn(
          "p-2 overflow-y-auto scrollbar-none hover:scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
          {
            "border-t rounded-none": !atTop,
            "border-b rounded-none": !atBottom,
          }
        )}
        onScroll={handleScroll}
      >
        {children}
      </div>
    </div>
  );
}

export default StaticColumn;
