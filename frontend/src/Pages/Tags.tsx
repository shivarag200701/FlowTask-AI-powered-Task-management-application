import { useAddEditTagModal } from "@/components/modals/AddEditTagModal";
import ListView, {
  TagsPageControls,
} from "@/features/tags/components/ListView";
import PageContentHeader from "@/layouts/PageContentHeader";

function Tags() {
  return (
    <div>
      <PageContentHeader title="Tags" controls={<TagsPageControls />} />
      <ListView />
    </div>
  );
}

export default Tags;
