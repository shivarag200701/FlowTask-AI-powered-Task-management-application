import { useProject, useProjectSections } from "@/hooks/use-projects";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import Section from "./Section";

function ListView({ id }: { id: string }) {
  const { data: project } = useProject(id);
  const { data: sections } = useProjectSections(id);

  return (
    <PageWidthWrapper className="max-w-3xl p-10">
      <h1 className="text-3xl font-semibold">{project?.name}</h1>
      <div className="mt-5 flex flex-col gap-2">
        {sections?.map((section) => (
          <Section section={section} projectId={id} />
        ))}
      </div>
    </PageWidthWrapper>
  );
}

export default ListView;
