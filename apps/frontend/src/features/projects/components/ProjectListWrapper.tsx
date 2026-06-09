import type { PropsWithChildren } from "react";

function ProjectListWrapper({
  id,
  children,
}: PropsWithChildren & { id: number | string }) {
  return (
    <div
      className="flex flex-col first:border-t border-b border-x border-border/70 first:rounded-t-xl last:rounded-b-xl hover:bg-accent cursor-pointer transition-all duration-200"
      key={id}
    >
      {children}
    </div>
  );
}

export default ProjectListWrapper;
