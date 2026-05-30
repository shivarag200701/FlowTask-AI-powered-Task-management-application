import { useProject } from "@/hooks/use-projects";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";

function BoardView({ id }: { id: string }) {
  const { data: project } = useProject(id);

  return (
    <PageWidthWrapper className="pt-10">
      <h1 className="font-semibold text-3xl">{project?.name}</h1>
    </PageWidthWrapper>
  );
}

export default BoardView;
