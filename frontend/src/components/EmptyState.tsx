import type { ReactNode } from "react";
import AnimatedScrollContainer from "./ui/animated-scroll-container";

type EmptyStateProps = {
  title?: string;
  description?: string;
  addButton?: ReactNode;
};

function EmptyState({ title, description, addButton }: EmptyStateProps) {
  return (
    <div className=" w-full py-10 px-4 gap-y-6 sm:h-[500px] border border-border rounded-md flex flex-col items-center  justify-center overflow-hidden">
      <div className="h-[144px] overflow-hidden">
        <AnimatedScrollContainer />
      </div>
      <div className="text-center">
        <div className="text-base font-medium text-neutral-900">{title}</div>
        <p className="text-sm text-neutral-500 mt-2">{description}</p>
      </div>
      <div className="flex gap-2">{addButton}</div>
    </div>
  );
}

export default EmptyState;
