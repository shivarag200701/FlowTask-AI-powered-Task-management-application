import DraggableColumn from "@/components/drag-drop/DraggableColumn";
import DragOverlayColumn from "@/components/drag-drop/DragOverlayColumn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectContext } from "@/context/ProjectContext";
import {
  useCreateProjectSection,
  useProject,
  useProjectSections,
} from "@/hooks/use-projects";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { SquarePlus } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

function BoardView() {
  const { projectId: id } = useProjectContext();

  const { data: project } = useProject(id);
  const { data: sections } = useProjectSections(id);

  const [IsAddSectionOpen, setIsAddSectionOpen] = useState(false);

  return (
    <PageWidthWrapper className="pt-10 overflow-x-auto scrollbar-none max-w-none !px-0">
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
            <AddSection
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

type FormValues = {
  sectionName: string;
};

function AddSection({
  setIsAddSectionOpen,
  projectId,
}: {
  setIsAddSectionOpen: Dispatch<SetStateAction<boolean>>;
  projectId: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      sectionName: "",
    },
  });

  const { mutateAsync } = useCreateProjectSection({ projectId });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    mutateAsync({ name: data.sectionName });
    setIsAddSectionOpen(false);
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          className="shadow-none w-[250px]"
          {...register("sectionName", { required: "tag name is required" })}
        />
        <div className="flex gap-2 mt-2">
          <Button className="w-fit rounded-md" size="sm" disabled={!isValid}>
            Add Section
          </Button>
          <Button
            className="w-fit hover:bg-accent"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setIsAddSectionOpen(false);
            }}
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default BoardView;
