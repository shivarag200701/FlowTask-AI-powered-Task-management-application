import { BottomToolbar } from "@/components/ui/toolbar";
import ListView, {
  TagsPageControls,
} from "@/features/tags/components/ListView";
import { TagSelectionProvider } from "@/features/tags/TagSelectionContext";
import PageContentHeader from "@/layouts/PageContentHeader";

function Tags() {
  return (
    <div>
      <PageContentHeader title="Tags" controls={<TagsPageControls />} />
      <TagSelectionProvider>
        <ListView />
        <BottomToolbar text="viewing 1-8 of 8 links" />
      </TagSelectionProvider>
    </div>
  );
}

export default Tags;
