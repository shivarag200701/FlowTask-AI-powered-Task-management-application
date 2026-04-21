import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import TagCard from "./TagCard";

function ListView() {
  const tags = ["flowtask", "hi there", "high", "personal", "testing"];
  return (
    <PageWidthWrapper className="grid pt-6">
      {tags.map((tag) => (
        <div
          className="flex flex-col border-t border-l border-r border-border/70  first:rounded-t-xl last:border-b last:rounded-b-xl"
          key={tag}
        >
          <TagCard tag={tag} />
        </div>
      ))}
    </PageWidthWrapper>
  );
}

export default ListView;
