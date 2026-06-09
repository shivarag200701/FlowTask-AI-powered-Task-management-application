import ListView, {
  TagsPageControls,
} from "@/features/tags/components/ListView";
import TagToolBar from "@/features/tags/components/TagToolBar";
import { TagSelectionProvider } from "@/features/tags/TagSelectionContext";
import PageContentHeader from "@/layouts/PageContentHeader";

function Tags() {
  return (
    <div>
      <PageContentHeader title="Tags" controls={<TagsPageControls />} />
      <TagSelectionProvider>
        <ListView />
        <TagToolBar />
      </TagSelectionProvider>
    </div>
  );
}

export default Tags;
