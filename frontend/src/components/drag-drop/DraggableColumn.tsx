import type { TodoWithCompleteAtDateTime } from "@/types";
import { useSortable } from "@dnd-kit/react/sortable";
import DraggableTask from "./DraggableTask";
import { CirclePlus, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { useAddEditTodoModal } from "../modals/AddEditTodoModal";
import { useState } from "react";
import { Popover } from "../ui/popover";
import MoreSectionOptionsDropDown from "../popovers/MoreSectionOptionsDropDown";
import { useDeleteProjectSection } from "@/hooks/use-projects";
import { useProjectContext } from "@/context/ProjectContext";
import { AddEditSection } from "@/features/projects/components/AddEditSection";
import { useConfirmModal } from "../modals/ConfirmModal";

function DraggableColumn({
  id,
  index,
  todos,
  column,
  sortKey,
}: {
  id: string;
  index: number;
  todos: TodoWithCompleteAtDateTime[];
  column: string;
  sortKey: string;
}) {
  const { setShowAddEditTodoModal, AddEditTodoModal } = useAddEditTodoModal({
    sectionId: id,
  });

  const { projectId } = useProjectContext();

  const { mutateAsync } = useDeleteProjectSection({ projectId, sectionId: id });
  const { ConfirmModal, setShowConfirmModal } = useConfirmModal({
    title: "Delete section?",
    description: (
      <div className="text-sm">
        The <span className="font-semibold">{column}</span> section will be
        deleted permanently
      </div>
    ),
    confirmText: "Delete",
    onConfirm: mutateAsync,
    variant: "destructive",
  });

  const [IsMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isEditing, SetIsEditing] = useState(false);
  const { ref, isDragging } = useSortable({
    id,
    index,
    type: "column",
    accept: "column",
    data: { id, column, sortKey },
  });

  if (isDragging) {
    return (
      <div ref={ref} className={`min-w-[260px] mb-2 bg-accent rounded-lg`} />
    );
  }

  return (
    <>
      <div
        ref={ref}
        className="min-w-[290px] h-fit hover:shadow-[0_5px_10px_rgba(0,0,0,0.15)] duration-200 transition-all cursor-grab rounded-lg flex flex-col gap-1.5 items-center text-sm font-semibold  p-2"
      >
        <div className="text-left flex justify-between w-full">
          {isEditing ? (
            <AddEditSection
              setIsAddSectionOpen={SetIsEditing}
              projectId={projectId}
              editing
              sectionId={id}
              sectionName={column}
            />
          ) : (
            <span>{column}</span>
          )}
          <Popover
            openPopover={IsMoreOptionsOpen}
            setOpenPopover={setIsMoreOptionsOpen}
            content={
              <MoreSectionOptionsDropDown
                onDelete={() => {
                  setIsMoreOptionsOpen(false);
                  setShowConfirmModal(true);
                }}
                onEdit={() => {
                  SetIsEditing(true);
                  setIsMoreOptionsOpen(false);
                }}
              />
            }
            sideOffset={5}
          >
            <Button
              className="w-fit hover:bg-accent"
              variant="custom"
              icon={<MoreHorizontal color="#808080" strokeWidth={2.5} />}
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </Popover>
        </div>
        <div className="p-2">
          {todos.length === 0 ? (
            <EmptyColumn columnId={id} />
          ) : (
            todos.map((todo, index) => (
              <DraggableTask
                column={id}
                id={todo.id}
                index={index}
                todo={todo}
                key={todo.id}
              />
            ))
          )}
        </div>
        <Button
          className="flex gap-2 justify-start items-center w-full px-2 hover:bg-accent cursor-pointer rounded-md hover:text-primary group"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setShowAddEditTodoModal(true);
          }}
        >
          <CirclePlus size={18} />
          <span className="font-light text-neutral-400 group-hover:text-primary">
            Add Task
          </span>
        </Button>
      </div>
      <AddEditTodoModal />
      {ConfirmModal}
    </>
  );
}

function EmptyColumn({ columnId }: { columnId: string }) {
  const { ref } = useSortable({
    id: `empty-${columnId}`,
    index: 0,
    accept: "item",
    type: "item",
    group: columnId,
  });

  return <div ref={ref} className="w-[260px] min-h-[70px] max-h-[90px]"></div>;
}

export default DraggableColumn;
