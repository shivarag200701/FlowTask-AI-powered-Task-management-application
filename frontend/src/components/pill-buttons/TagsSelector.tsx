import { useTags } from "@/hooks/use-tags";
import ComboBox from "../ComboBox";
import TagBadge from "../TagBadge";
import { Tag } from "lucide-react";
import type { TagProps, TodoTag } from "@/types";
import { useMemo } from "react";

function TagsSelector({
  open,
  setOpen,
  tags,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  tags?: TodoTag[];
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
    >
      {selectedTags && selectedTags.length > 0 && (
        <div className="flex gap-2">
          {tags?.map((tag) => (
            <TagBadge name={tag.name} color={tag.color} key={tag.id} />
          ))}
        </div>
      )}
    </ComboBox>
  );
}
export default TagsSelector;
