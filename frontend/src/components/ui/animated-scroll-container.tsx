import TagBadge from "../TagBadge";

function AnimatedScrollContainer() {
  return (
    <div className="flex flex-col gap-3 animate-scroll">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="h-15.5 w-60 border border-border rounded-lg shadow-xs flex-none flex items-center justify-start p-4 gap-4"
        >
          <TagBadge
            color="gray"
            withIcon
            className="bg-accent size-7 items-center justify-center"
          />
          <div className="h-3 w-[50%] bg-neutral-200 rounded-xs" />
        </div>
      ))}
    </div>
  );
}
export default AnimatedScrollContainer;
