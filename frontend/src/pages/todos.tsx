import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import TagFilterDisplayer from "@/features/tags/components/TagFilterDisplayer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTags } from "@/hooks/use-tags";
import PageContentHeader from "@/layouts/PageContentHeader";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { cn } from "@/lib/utils";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate, useSearchParams } from "react-router-dom";

function Todos() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlTags = searchParams.get("tagIds")?.split(",");

  console.log(urlTags);

  const urlTagSet = new Set(urlTags);

  const { data: tags } = useTags({ query: { search: "" } });
  const navigate = useNavigate();

  const selectedTags = tags?.filter((tag) => urlTagSet.has(tag.id));

  useHotkeys("esc", () => {
    setSearchParams("");
  });

  return (
    <div className={cn("")}>
      <PageContentHeader
        title="Todos"
        controls={<div>This is the control</div>}
      />
      <PageWidthWrapper className="pt-6 px-3 lg:pt-12 flex flex-col overflow-x-auto ">
        <div className="flex items-center justify-between gap-4 mb-4">
          <TagFilterDisplayer tags={selectedTags} />
          <button
            className="h-[38px] flex gap-2 text-neutral-500 items-center transition-all duration-200 border border-transparent hover:border-border cursor-pointer px-3 py-2 rounded-md"
            onClick={() => {
              setSearchParams("");
            }}
          >
            <div className="font-medium">Clear Filters</div>
            <Kbd className="w-fit border">ESC</Kbd>
          </button>
        </div>
        {(!searchParams.get("tagIds") ||
          searchParams.get("tagIds")?.length === 0) && (
          <EmptyState
            title="No tags selected"
            description="Pick one or more tags to see the matching todos."
            addButton={
              <Button onClick={() => navigate("/app/tags")}>Browse tags</Button>
            }
          />
        )}
      </PageWidthWrapper>
    </div>
  );
}

export default Todos;
