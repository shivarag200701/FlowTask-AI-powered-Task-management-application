function ProjectCardPlaceholder() {
  return (
    <div className="flex justify-between items-center py-3 px-4 animate-pulse">
      <div className="flex gap-3 items-center">
        <div className="h-8 w-8 rounded-lg bg-neutral-200" />
        <div className="h-3 w-32 rounded-sm bg-neutral-200" />
      </div>
      <div className="flex gap-4 items-center">
        <div className="h-7 w-[80px] rounded-md bg-neutral-200" />
        <div className="h-7 w-7 rounded-md bg-neutral-200" />
      </div>
    </div>
  );
}

export default ProjectCardPlaceholder;
