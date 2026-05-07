import ComboBox from "@/components/ComboBox";
import TagBadge from "@/components/TagBadge";
import { useTags } from "@/hooks/use-tags";
import type { TagProps } from "@/types";
import { getTagOption } from "@/utils/functions/get-tag-options";
import { Tag, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

function TagFilterDisplayer({ tags }: { tags?: TagProps[] }) {
  const [_searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { data: availableTags, isLoading: tagsLoading } = useTags({
    query: { search: "" },
  });

  const options = useMemo(
    () => availableTags?.map((tag) => getTagOption(tag)),
    [availableTags],
  );
  return (
    <div className="flex justify-center border border-border rounded-lg h-full">
      <div className="border-r border-border px-3 py-2 flex items-center gap-2">
        <Tag className="size-4" />
        <span className="text-sm font-medium">Tag</span>
      </div>
      <div className="px-3 py-2 flex items-center justify-center border-r">
        <span className="text-sm  text-neutral-500 font-medium ">is</span>
      </div>
      <ComboBox
        open={open}
        onOpenChange={setOpen}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        triggerClassName="h-fit"
        matchTriggerWidth={false}
        multiple
        options={tagsLoading ? undefined : options}
        shouldFilter
        selectedOptions={tags?.map((tag) => getTagOption(tag))}
        setSelectedOptions={(option) => {
          setSearchParams((prev) => {
            const current = prev.get("tagIds") || "";

            let currentTags = current.split(",").filter(Boolean);

            if (currentTags.includes(option.value)) {
              currentTags = currentTags.filter((id) => id !== option.value);
            } else {
              currentTags.push(option.value);
            }

            if (currentTags.length > 0) {
              prev.set("tagIds", currentTags.join(","));
            } else {
              prev.delete("tagIds");
            }

            return prev;
          });
        }}
        contentClassName="w-[300px]"
      >
        <div className="flex items-center justify-center  text-xs w-full px-3 py-2 border-r transition-all duration-200 hover:bg-accent cursor-pointer">
          {tags?.length === 1 ? (
            <div className="flex gap-2 items-center">
              <TagBadge color={tags[0].color} withIcon className="p-1" />
              <span className="font-medium">{tags[0].name}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2.5">
              <div className="flex items-center -space-x-2">
                {tags?.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    color={tag.color}
                    withIcon
                    className="ring-2 ring-background p-1"
                  />
                ))}
              </div>
              <span className="font-medium">{tags?.length} tags</span>
            </div>
          )}
        </div>
      </ComboBox>
      {tags && (
        <button
          className="p-2 flex items-center hover:bg-accent cursor-pointer rounded-r-lg transition-all duration-200"
          onClick={() => {
            setSearchParams("");
          }}
        >
          <X className="size-3.5 " />
        </button>
      )}
    </div>
  );
}

export default TagFilterDisplayer;
