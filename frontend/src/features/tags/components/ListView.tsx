import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import TagCard from "./TagCard";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTags } from "@/hooks/use-tags";
import InputBox from "@/features/InputBox";
import { SearchBoxPersisted } from "@/components/SearchBox";

function ListView() {
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const { data: tags } = useTags({ query: { search } });
  return (
    <PageWidthWrapper className="grid pt-6">
      <SearchBoxPersisted />
      {tags &&
        tags.map((tag) => (
          <div
            className="flex flex-col border-t border-l border-r border-border/70  first:rounded-t-xl last:border-b last:rounded-b-xl"
            key={tag.id}
          >
            <TagCard tag={tag} />
          </div>
        ))}
    </PageWidthWrapper>
  );
}

export default ListView;
