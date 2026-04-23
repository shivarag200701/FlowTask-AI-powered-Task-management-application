import { useTags } from "@/hooks/use-tags";
import ComboBox from "../ComboBox";
import TagBadge from "../TagBadge";
import { Tag } from "lucide-react";
import type { TagProps } from "@/types";
import { useMemo } from "react";

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
  function getTagOption(tag: TagProps) {
    return {
      value: tag.id,
      label: tag.name,
      meta: {
        color: tag.color,
      },
      icon: <Tag className="size-4" />,
    };
  }

  const options = useMemo(
    () => availableTags?.map((tag) => getTagOption(tag)),
    [availableTags],
  );

  return (
    <ComboBox
      onOpenChange={setOpen}
      open={open}
      options={tagsLoading ? undefined : options}
    >
      <div className="flex gap-2">
        {availableTags?.slice(1).map((tag) => (
          <TagBadge name={tag.name} color={tag.color} />
        ))}
      </div>
    </ComboBox>
  );
}
export default TagsSelector;
