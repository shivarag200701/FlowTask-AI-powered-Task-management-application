import { cn } from "@/lib/utils";

export function Gradient({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-y-0 left-1/2 aspect-square -translate-x-1/2 -translate-y-20",
        className
      )}
    >
      <div className="-scale-x-[1.8] blur-2xl size-full">
        <div
          className={cn(
            "size-full -rotate-90 saturate-[3]",
            "bg-[conic-gradient(from_279deg,#EAB308_47deg,#F00_121deg,#00FFF9_190deg,#855AFC_251deg,#3A8BFD_267deg,#A3ECB3_314deg,#EAB308_360deg)]"
          )}
        />
      </div>
    </div>
  );
}
