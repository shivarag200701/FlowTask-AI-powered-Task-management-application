import DraggableColumn from "@/components/drag-drop/DraggableColumn";
import DragOverlayColumn from "@/components/drag-drop/DragOverlayColumn";
import { Button } from "@/components/ui/button";
import { useProjectContext } from "@/context/ProjectContext";
import { useProject, useProjectSections } from "@/hooks/use-projects";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { SquarePlus } from "lucide-react";
import { useState } from "react";
import { AddEditSection } from "./AddEditSection";

function BoardView() {
  const { projectId: id } = useProjectContext();

  const { data: project } = useProject(id);
  const { data: sections } = useProjectSections(id);

  const [IsAddSectionOpen, setIsAddSectionOpen] = useState(false);

  return (
    <PageWidthWrapper className="pt-10 overflow-x-auto scrollbar-none max-w-none !px-0 h-full">
      <h1 className="font-semibold text-3xl px-5 md:px-6">{project?.name}</h1>
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
        <div className="flex gap-2 p-5 md:px-6 min-w-fit">
          {sections?.map((section, index) => (
            <DraggableColumn
              id={section.id}
              index={index}
              key={section.id}
              todos={section.todos}
              column={section.name}
            />
          ))}
          {!IsAddSectionOpen ? (
            <Button
              className="min-w-[280px] max-w-[280px] hover:text-primary"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddSectionOpen(true);
              }}
            >
              <SquarePlus />
              <span>Add Section</span>
            </Button>
          ) : (
            <AddEditSection
              setIsAddSectionOpen={setIsAddSectionOpen}
              projectId={id}
            />
          )}
        </div>
        <DragOverlayColumn sections={sections ?? []} />
      </DragDropProvider>
    </PageWidthWrapper>
  );
}

export default BoardView;
