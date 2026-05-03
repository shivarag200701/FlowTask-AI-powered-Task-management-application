import { useTags } from "@/hooks/use-tags";
import PageContentHeader from "@/layouts/PageContentHeader";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";

function Todos() {
  const [searchParams] = useSearchParams();
  console.log("search params", searchParams.get("tagIds"));

  const { data: tags } = useTags({ query: { search: "" } });

  const selectedTag = tags?.find(
    (tag) => tag.id === searchParams.get("tagIds"),
  );

  return (
    <div className={cn("")}>
      <PageContentHeader
        title={selectedTag?.name}
        controls={<div>This is the control</div>}
      />
    </div>
  );
}

export default Todos;
