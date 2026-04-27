import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import TagCard from "./TagCard";
import { useSearchParams } from "react-router-dom";
import { useTags } from "@/hooks/use-tags";
import { SearchBoxPersisted } from "@/components/SearchBox";
import { useAddEditTagModal } from "@/components/modals/AddEditTagModal";
import { useEffect, useState } from "react";
import type { TagProps } from "@/types";
import NoTags from "./NoTags";
import TagsListWrapper from "./TagsListWrapper";
import TagCardPlaceholder from "./TagCardPlaceholder";

function ListView() {
  const [searchParams] = useSearchParams();
  const [selectedTag, setSelectedTag] = useState<TagProps | null>(null);
  const { AddEditTagModal, setShowAddEditTagModal } = useAddEditTagModal(
    selectedTag ?? undefined,
  );

  const search = searchParams.get("search") ?? "";
  const { data: tags, isLoading: tagsLoading } = useTags({ query: { search } });

  return (
    <PageWidthWrapper className="pt-6">
      <SearchBoxPersisted />
      <div>
        {tagsLoading ? (
          <>
            {Array.from({ length: 5 }, (_, index) => (
              <TagsListWrapper id={index}>
                <TagCardPlaceholder />
              </TagsListWrapper>
            ))}
          </>
        ) : (
          <>
            {tags &&
              tags.map((tag) => (
                <TagsListWrapper id={tag.id}>
                  <TagCard
                    tag={tag}
                    onEdit={(tag) => {
                      setSelectedTag(tag);
                      setShowAddEditTagModal(true);
                    }}
                  />
                </TagsListWrapper>
              ))}
          </>
        )}

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
