import type { ProjectWithDateTime } from "@/types";

function exractProjectSection({
  project,
  sectionId,
}: {
  project?: ProjectWithDateTime;
  sectionId: string;
}) {
  return project?.sections.find((section) => section.id === sectionId);
}

export default exractProjectSection;
