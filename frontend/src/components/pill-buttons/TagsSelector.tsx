import { Tag } from "lucide-react";
import { Button } from "../ui/button";

function TagsSelector() {
  return (
    <Button
      variant="outline"
      className="w-fit text-xs"
      icon={<Tag />}
      size="sm"
      type="button"
    >
      Tag
    </Button>
  );
}
export default TagsSelector;
