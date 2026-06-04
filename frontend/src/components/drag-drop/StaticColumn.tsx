import type { ReactNode } from "react";

function StaticColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-[290px] h-fit  duration-200 transition-all rounded-lg flex flex-col gap-1.5 items-center text-sm font-semibold p-2">
      <div className="text-left w-full">
        <span>{title}</span>
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

export default StaticColumn;
