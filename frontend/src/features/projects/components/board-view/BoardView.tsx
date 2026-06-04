import DraggableColumn from "@/components/drag-drop/DraggableColumn";
import DragOverlayColumn from "@/components/drag-drop/DragOverlayColumn";
import { Button } from "@/components/ui/button";
import { useProjectContext } from "@/context/ProjectContext";
import {
  useNoSectionProjectTodos,
  useProject,
  useProjectSections,
  useUpdateProjectSection,
} from "@/hooks/use-projects";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { SquarePlus } from "lucide-react";
import { useState } from "react";
import { AddEditSection } from "../AddEditSection";
import { useUpdateTodo } from "@/hooks/use-todos";
import type { UpdateTodo } from "@shiva200701/todotypes";
import type { TodoWithCompleteAtDateTime } from "@/types";
import StaticColumn from "@/components/drag-drop/StaticColumn";
import DraggableTask from "@/components/drag-drop/DraggableTask";

type DragEndPayload = DragEndEvent;

function BoardView() {
  const { projectId: id } = useProjectContext();

  const { data: project } = useProject(id);
  const { data: sections } = useProjectSections(id);
  const { mutateAsync } = useUpdateTodo();
  const { data: noSection } = useNoSectionProjectTodos(id);

  const { mutateAsync: updateSection } = useUpdateProjectSection({
    projectId: id,
  });

  const [IsAddSectionOpen, setIsAddSectionOpen] = useState(false);

  function handleDragEnd(event: DragEndPayload) {
    const { source, target } = event.operation;
    if (source && target && isSortable(source) && isSortable(target)) {
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
      if (type === "item" && sections) {
        const { index, group, initialGroup } = source;
        const { data } = target;
        //reoderinng among same column
        const targetSection = sections?.find((s) => s.id === group);
        const sourceSection = sections?.find((s) => s.id === initialGroup);
        const sourceTodos = sourceSection?.todos ?? noSection?.todos ?? [];

        if (group === initialGroup) {
          const todos = targetSection?.todos ?? noSection?.todos ?? [];
          const reorderedTodos = [...todos];
          const [moved] = reorderedTodos.splice(
            source.initialIndex as number,
            1
          );
          reorderedTodos.splice(index as number, 0, moved);

          const prevIndex =
            reorderedTodos[(index as number) - 1]?.sortKey ?? null;
          const nextIndex =
            reorderedTodos[(index as number) + 1]?.sortKey ?? null;

          const payload: UpdateTodo = { prevIndex, nextIndex };

          mutateAsync({ id: data.id, data: payload, type: "updateOrder" });
          return;
        } else {
          const targetTodos: TodoWithCompleteAtDateTime[] = [
            ...(targetSection?.todos ?? []),
          ];
          const draggedTodo = sourceTodos.find((t) => t.id === source.id);

          targetTodos.splice(index as number, 0, draggedTodo!);

          const prevIndex = targetTodos[(index as number) - 1]?.sortKey ?? null;
          const nextIndex = targetTodos[(index as number) + 1]?.sortKey ?? null;
          let newSectionId = source.group as string | null; // target section ID

          if (source.group === "(No Section)") {
            newSectionId = null;
          }

          const payload: UpdateTodo = {
            prevIndex,
            nextIndex,
            projectSectionId: newSectionId,
          };

          mutateAsync({ data: payload, id: data.id, type: "updateOrder" });
        }
      }
    }
  }

  return (
    <PageWidthWrapper className="pt-10 overflow-x-auto scrollbar-none max-w-none !px-0 h-full">
      <h1 className="font-semibold text-3xl px-5 md:px-6">{project?.name}</h1>
      <DragDropProvider
        onDragEnd={handleDragEnd}
        onDragOver={(event) => {
          console.group(event);
        }}
      >
        <div className="flex gap-2 p-5 md:px-6 min-w-fit">
          <StaticColumn title="(No Section)">
            {noSection?.todos.length === 0 ? (
              <div className="w-[260px] min-h-[70px] max-h-[90px]" />
            ) : (
              noSection?.todos.map((todo, index) => (
                <DraggableTask
                  column="(No Section)"
                  id={todo.id}
                  index={index}
                  todo={todo}
                  key={todo.id}
                />
              ))
            )}
          </StaticColumn>
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
        <DragOverlayColumn
          sections={sections ?? []}
          noSectionTodos={noSection?.todos ?? []}
        />
      </DragDropProvider>
    </PageWidthWrapper>
  );
}

export default BoardView;
