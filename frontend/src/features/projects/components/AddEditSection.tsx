import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateProjectSection,
  useUpdateProjectSection,
} from "@/hooks/use-projects";
import type { Dispatch, SetStateAction } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

type FormValues = {
  sectionName: string;
};

export function AddEditSection({
  setIsAddSectionOpen,
  projectId,
  editing = false,
  sectionId,
  sectionName = "",
}: {
  setIsAddSectionOpen: Dispatch<SetStateAction<boolean>>;
  projectId: string | null;
  editing?: boolean;
  sectionId?: string;
  sectionName?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      sectionName,
    },
  });

  const { mutateAsync: createSection } = useCreateProjectSection({ projectId });
  const { mutateAsync: updateSection } = useUpdateProjectSection({
    projectId,
    sectionId: sectionId ?? "",
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!editing) {
      createSection({ name: data.sectionName });
    } else if (editing && sectionId) {
      updateSection({
        data: { name: data.sectionName },
      });
    }
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
            {editing ? "Rename" : "Add Section"}
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
