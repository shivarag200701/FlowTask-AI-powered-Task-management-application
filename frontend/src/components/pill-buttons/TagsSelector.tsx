import { useTags } from "@/hooks/use-tags";
import ComboBox from "../ComboBox";
import TagBadge from "../TagBadge";
import { Tag } from "lucide-react";
import type { TodoTag } from "@/types";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

function TagsSelector({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { data: availableTags, isLoading: tagsLoading } = useTags({
    query: { search: "" },
  });
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

  const {
    control,
    setValue,
    formState: { isDirty },
  } = useFormContext();
  const [tags] = useWatch({
    control,
    name: ["tags"],
  }) as [TodoTag[]]; // need to fix this to give type to useFormContext

  const options = useMemo(
    () => availableTags?.map((tag) => getTagOption(tag)),
    [availableTags],
  );

  const selectedTags = useMemo(
    () => tags?.map((tag) => getTagOption(tag)),
    [tags],
  );

  return (
    <ComboBox
      onOpenChange={setOpen}
      open={open}
      options={tagsLoading ? undefined : options}
      placeholder="Select tags..."
      selectedTags={selectedTags}
      setSelectedTags={(option) => {
        //need to change for case where we add a new Tag
        const id = option.value;
        const alreadySelected = tags.find((t) => t.id === id);

        if (alreadySelected) {
          setValue(
            "tags",
            (tags || []).filter((t) => t.id !== id),
            { shouldDirty: true },
          );
        } else {
          const tagToAdd = availableTags?.find((t) => t.id === id);
          if (tagToAdd)
            setValue("tags", [...(tags || []), tagToAdd], {
              shouldDirty: true,
            });
        }
      }}
    >
      {selectedTags && selectedTags.length > 0 && (
        <div className="flex gap-2">
          {tags?.map((tag) => (
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
