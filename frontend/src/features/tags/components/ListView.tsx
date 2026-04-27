import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import TagCard from "./TagCard";
import { useSearchParams } from "react-router-dom";
import { useTags } from "@/hooks/use-tags";
import { SearchBoxPersisted } from "@/components/SearchBox";
import { useAddEditTagModal } from "@/components/modals/AddEditTagModal";
import { useState } from "react";
import type { TagProps } from "@/types";
import NoTags from "./NoTags";

function ListView() {
  const [searchParams] = useSearchParams();
  const [selectedTag, setSelectedTag] = useState<TagProps | null>(null);
  const { AddEditTagModal, setShowAddEditTagModal } = useAddEditTagModal(
    selectedTag ?? undefined,
  );

  const search = searchParams.get("search") ?? "";
  const { data: tags } = useTags({ query: { search } });

  return (
    <PageWidthWrapper className="pt-6">
      <SearchBoxPersisted />
      <div>
        {tags &&
          tags.map((tag) => (
            <div
              className="flex flex-col first:border-t border-b border-x border-border/70  first:rounded-t-xl  last:rounded-b-xl hover:bg-accent cursor-pointer transition-all duration-200"
              key={tag.id}
            >
              <TagCard
                tag={tag}
                onEdit={(tag) => {
                  setSelectedTag(tag);
                  setShowAddEditTagModal(true);
                }}
              />
            </div>
          ))}
        {tags?.length === 0 && <NoTags />}
      </div>
      <AddEditTagModal />
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
