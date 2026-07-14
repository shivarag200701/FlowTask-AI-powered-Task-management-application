import { useCreateTag, useTagCount, useTags } from "@/hooks/use-tags";
import ComboBox from "../ComboBox";
import TagBadge from "../TagBadge";
import { Tag } from "lucide-react";
import type { TodoTag } from "@/types";
import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { MAX_TAGS_PER_PAGE } from "@/utils/constants/tags";
import { getRandomTagColor } from "@/utils/functions/tag-colors";
import { useDebounce } from "use-debounce";

function TagsSelector({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue] = useDebounce(searchValue, 500);

  function getTagOption(tag: TodoTag) {
    return {
      value: tag.id,
      label: tag.name,
      meta: {
        color: tag.color,
      },
      icon: <Tag className="size-3.5" />,
    };
  }

  const { control, setValue } = useFormContext();
  const [tags] = useWatch({
    control,
    name: ["tags"],
  }) as [TodoTag[]]; // need to fix this to give type to useFormContext

  const { data: tagCount } = useTagCount();

  const asyncSearch = tagCount > MAX_TAGS_PER_PAGE;

  const { data: availableTags, isLoading: tagsLoading } = useTags({
    query: {
      search: asyncSearch
        ? debouncedValue.length > 0
          ? debouncedValue
          : undefined
        : "",
    },
  });

  const { mutateAsync } = useCreateTag();

  const options = useMemo(
    () => availableTags?.map((tag) => getTagOption(tag)),
    [availableTags]
  );

  const selectedTags = useMemo(
    () => tags?.map((tag) => getTagOption(tag)),
    [tags]
  );

  return (
    <ComboBox
      onOpenChange={setOpen}
      open={open}
      options={tagsLoading ? undefined : options}
      placeholder="Select tags..."
      selectedOptions={selectedTags}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      shouldFilter
      multiple
      inputBoxText="search or add tags..."
      icon={<Tag />}
      trigger
      // multiple
      setSelectedOptions={(option) => {
        //need to change for case where we add a new Tag
        const id = option.value;
        const alreadySelected = tags.find((t) => t.id === id);

        if (alreadySelected) {
          setValue(
            "tags",
            (tags || []).filter((t) => t.id !== id),
            { shouldDirty: true }
          );
        } else {
          const tagToAdd = availableTags?.find((t) => t.id === id);
          if (tagToAdd)
            setValue("tags", [...(tags || []), tagToAdd], {
              shouldDirty: true,
            });
        }
      }}
      onCreate={async (tagName) => {
        await mutateAsync({ name: tagName, color: getRandomTagColor() });
      }}
      loading={tagsLoading}
      triggerClassName="px-2.5 py-1.5 min-h-10 h-auto w-full"
      contentClassName="w-[400px]"
    >
      {selectedTags && selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags?.slice(0, 10).map((tag) => (
            <TagBadge
              name={tag.name}
              color={tag.color}
              key={tag.id}
              className="animate"
            />
          ))}
        </div>
      )}
    </ComboBox>
  );
}
export default TagsSelector;
