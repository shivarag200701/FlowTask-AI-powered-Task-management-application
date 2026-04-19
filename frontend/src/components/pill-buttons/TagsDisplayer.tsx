import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReactNode } from "react";

//add tags and colour code them
function TagsDisplayer() {
  return (
    <TagsToolTip tags={["personal", "gym", "todo"]}>
      <TagButton tag="Tag" />
    </TagsToolTip>
  );
}

function TagsToolTip({
  children,
  tags,
}: {
  children: ReactNode;
  tags: string[];
}) {
  return (
    <div>
      {tags.length > 1 ? (
        <Tooltip>
          <TooltipTrigger>{children}</TooltipTrigger>
          <TooltipContent sideOffset={8}>
            <div className="flex flex-wrap gap-1.5 p-2">
              {tags.map((tag) => (
                <TagButton key={tag} tag={tag} />
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        children
      )}
    </div>
  );
}

function TagButton({ tag, plus }: { tag: string; plus?: number }) {
  return (
    <Button
      variant="outline"
      className="w-fit text-xs"
      icon={<Tag />}
      size="sm"
      type="button"
    >
      {tag}
    </Button>
  );
}

export default TagsDisplayer;
