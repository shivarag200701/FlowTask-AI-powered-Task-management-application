import DraggableColumn from "@/components/drag-drop/DraggableColumn";
import DragOverlayColumn from "@/components/drag-drop/DragOverlayColumn";
import { Button } from "@/components/ui/button";
import { useProjectContext } from "@/context/ProjectContext";
import {
  useProject,
  useProjectSections,
  useUpdateProjectSection,
} from "@/hooks/use-projects";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { SquarePlus } from "lucide-react";
import { useState } from "react";
import { AddEditSection } from "./AddEditSection";

type DragEndPayload = DragEndEvent;

function BoardView() {
  const { projectId: id } = useProjectContext();

  const { data: project } = useProject(id);
  const { data: sections } = useProjectSections(id);

  const { mutateAsync: updateSection } = useUpdateProjectSection({
    projectId: id,
  });

  const [IsAddSectionOpen, setIsAddSectionOpen] = useState(false);

  function handleDragEnd(event: DragEndPayload) {
    const { source } = event.operation;
    if (source && isSortable(source)) {
      const { index, data, type } = source;
      if (type === "column" && sections) {
        //Reorder logic
        const reordered = [...sections];
        const [moved] = reordered.splice(source.initialIndex as number, 1);
        reordered.splice(index as number, 0, moved);

        const prevIndex = reordered[(index as number) - 1]?.sortKey ?? null;
        const nextIndex = reordered[(index as number) + 1]?.sortKey ?? null;

        updateSection({
          data: { prevIndex, nextIndex },
          sectionId: data.id,
        });
      }
    }
  }

  return (
    <PageWidthWrapper className="pt-10 overflow-x-auto scrollbar-none max-w-none !px-0 h-full">
      <h1 className="font-semibold text-3xl px-5 md:px-6">{project?.name}</h1>
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="flex gap-2 p-5 md:px-6 min-w-fit">
          {sections?.map((section, index) => (
            <DraggableColumn
              id={section.id}
              index={index}
              key={section.id}
              todos={section.todos}
              column={section.name}
              sortKey={section.sortKey}
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
