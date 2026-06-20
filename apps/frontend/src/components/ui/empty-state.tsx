import type { ReactNode } from "react";

function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <div className="p-4 rounded-2xl border border-neutral-300 bg-accent size-16 flex items-center justify-between">
        {icon}
      </div>
      <span className="font-semibold text-neutral-800">{title}</span>
      <span className="font-medium text-neutral-400 text-sm max-w-xs text-center">
        {description}
      </span>
    </div>
  );
}

export default EmptyState;
