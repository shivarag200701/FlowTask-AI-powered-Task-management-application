import ListView from "@/features/tags/components/ListView";
import PageContentHeader from "@/layouts/PageContentHeader";

function Tags() {
  return (
    <div>
      <PageContentHeader title="Tags" controls={<div>Hi there</div>} />
      <ListView />
    </div>
  );
}

export default Tags;
