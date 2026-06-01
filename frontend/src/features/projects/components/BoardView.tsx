import DraggableColumn from "@/components/drag-drop/DraggableColumn";
import DragOverlayColumn from "@/components/drag-drop/DragOverlayColumn";
import { useProjectContext } from "@/context/ProjectContext";
import { useProject, useProjectSections } from "@/hooks/use-projects";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";

function BoardView() {
  const { projectId: id } = useProjectContext();

  const { data: project } = useProject(id);
  const { data: sections } = useProjectSections(id);

  return (
    <PageWidthWrapper className="pt-10">
      <h1 className="font-semibold text-3xl">{project?.name}</h1>
      <DragDropProvider
        onDragStart={(event) => {
          if (isSortable(event.operation.source)) {
            const { initialGroup } = event.operation.source;
            console.log("initial group", initialGroup);
          }
        }}
        onDragOver={(event) => {
          console.log("event", event);
        }}
      >
        <div className="flex gap-2 pt-5">
          {sections?.map((section, index) => (
            <DraggableColumn
              id={section.id}
              index={index}
              key={section.id}
              todos={section.todos}
              column={section.name}
            />
          ))}
        </div>
        <DragOverlayColumn sections={sections ?? []} />
      </DragDropProvider>
    </PageWidthWrapper>
  );
}

export default BoardView;
