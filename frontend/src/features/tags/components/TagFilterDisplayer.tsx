import TagBadge from "@/components/TagBadge";
import type { TagProps } from "@/types";
import { Tag, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

function TagFilterDisplayer({ tags }: { tags?: TagProps[] }) {
  const [_searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="flex justify-center border border-border rounded-lg h-full">
      <div className="border-r border-border px-3 py-2 flex items-center gap-2">
        <Tag className="size-4" />
        <span className="text-sm font-medium">Tag</span>
      </div>
      <div className="px-3 py-2 flex items-center justify-center border-r">
        <span className="text-sm  text-neutral-500 font-medium ">is</span>
      </div>
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
                  className="ring-2 ring-background"
                />
              ))}
            </div>
            <span className="font-medium">{tags?.length} tags</span>
          </div>
        )}
      </div>
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
