import TagBadge from "@/components/TagBadge";
import { Button } from "@/components/ui/button";
import { MoreVerticalIcon, Tag } from "lucide-react";

function TagCard({ tag }: { tag: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 px-4">
      <div className="flex gap-3 text-sm items-center">
        <TagBadge color="blue" withIcon />
        {tag}
      </div>
      <div className="flex gap-10 items-center">
        <Button variant="outline" Initial="link" size="sm" className="w-fit" />
        <MoreVerticalIcon className="w-5 h-5" strokeWidth={1.5} />
      </div>
    </div>
  );
}

export default TagCard;
