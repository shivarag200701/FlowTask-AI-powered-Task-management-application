import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import TagCard from "./TagCard";
import { useSearchParams } from "react-router-dom";
import { useTags } from "@/hooks/use-tags";
import { SearchBoxPersisted } from "@/components/SearchBox";
import { useAddEditTagModal } from "@/components/modals/AddEditTagModal";

function ListView() {
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const { data: tags } = useTags({ query: { search } });
  return (
    <PageWidthWrapper className="grid pt-6">
      <SearchBoxPersisted />
      <div>
        {tags &&
          tags.map((tag) => (
            <div
              className="flex flex-col first:border-t border-b border-x border-border/70  first:rounded-t-xl  last:rounded-b-xl"
              key={tag.id}
            >
              <TagCard tag={tag} />
            </div>
          ))}
      </div>
    </PageWidthWrapper>
  );
}

export function TagsPageControls() {
  const { CreateTagButton, AddEditTagModal } = useAddEditTagModal();

  return (
    <>
      <AddEditTagModal />
      <CreateTagButton />
    </>
  );
}

export default ListView;
