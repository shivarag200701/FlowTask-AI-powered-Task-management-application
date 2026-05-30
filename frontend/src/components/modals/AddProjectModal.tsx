import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Button } from "../ui/button";
import { Kbd } from "../ui/kbd";
import { useHotkeys } from "react-hotkeys-hook";
import { Modal } from "../ui/modal";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Input } from "../ui/input";
import { useCreateProject } from "@/hooks/use-projects";

type FormValues = {
  name: string;
};

export function AddProjectModal({
  show,
  setShow,
  personal,
  workspaceId,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  personal?: boolean;
  workspaceId?: string;
}) {
  const {
    register,
    watch,
    handleSubmit,
    formState: { isValid, isSubmitting, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
    },
  });

  const name = watch("name");
  const { mutateAsync: createProject } = useCreateProject({
    name,
    personal,
    workspaceId,
  });

  const onSubmit: SubmitHandler<FormValues> = async () => {
    await createProject(undefined, {
      onSuccess: () => {
        setShow(false);
      },
    });
  };

  return (
    <Modal showModal={show} setShowModal={setShow}>
      <div className="flex flex-col items-center justify-center space-y-4 border-b border-border">
        <div className="flex flex-col space-y-1 items-center justify-center px-4 py-8 sm:px-16 sm:py-8 w-full">
          <img src="/logo.png" className="size-15" />
          <h3 className="font-medium text-lg">Create Project</h3>
          <p className="text-neutral-500 text-sm text-center">
            Keep your tasks organized under one project
          </p>
        </div>
      </div>
      <div className="bg-accent/50 flex flex-col gap-y-4 px-4 py-8 sm:px-16 sm:py-8 items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-6 w-full"
        >
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium">Project name</p>
            <Input
              placeholder="Project name"
              {...register("name", { required: "Project name is required" })}
            />
          </div>
          <Button
            Initial="Create Project"
            disabled={!isDirty || !isValid}
            isSubmitting={isSubmitting}
            Loading="Create Project"
          />
        </form>
      </div>
    </Modal>
  );
}

export function CreateProjectButton({
  setShow,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  useHotkeys("c", () => {
    setShow(true);
  });
  return (
    <Button
      className="w-fit"
      onClick={() => {
        setShow(true);
      }}
    >
      Create Project
      <Kbd>C</Kbd>
    </Button>
  );
}

export function useAddProjectModal({
  personal,
  workspaceId,
}: {
  personal?: boolean;
  workspaceId?: string;
}) {
  const [show, setShow] = useState(false);

  const CreateProjectButtonCallback = useCallback(
    () => <CreateProjectButton setShow={setShow} />,
    [setShow]
  );

  const AddEditTagModalCallback = useCallback(() => {
    return (
      <AddProjectModal
        show={show}
        setShow={setShow}
        personal={personal}
        workspaceId={workspaceId}
      />
    );
  }, [show, setShow]);
  return useMemo(
    () => ({
      CreateProjectButton: CreateProjectButtonCallback,
      AddProjectModal: AddEditTagModalCallback,
    }),
    [setShow, CreateProjectButtonCallback, AddEditTagModalCallback]
  );
}
