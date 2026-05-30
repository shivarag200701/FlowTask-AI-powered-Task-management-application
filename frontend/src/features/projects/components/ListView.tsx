import { useProject } from "@/hooks/use-projects";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";

function ListView({ id }: { id: string }) {
  const { data: project } = useProject(id);

  return (
    <PageWidthWrapper className="max-w-4xl pt-10">
      <h1 className="text-3xl font-semibold">{project?.name}</h1>
    </PageWidthWrapper>
  );
}

export default ListView;
