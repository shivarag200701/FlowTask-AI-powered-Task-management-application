import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useCreateWorkspace } from "@/hooks/use-workspaces";
import { Plus } from "lucide-react";

type FormValues = {
  name: string;
};

export function AddWorkspaceModal({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    register,
    handleSubmit,
    formState: { isValid, isSubmitting, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
    },
  });

  const { mutateAsync: createWorkspace } = useCreateWorkspace();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await createWorkspace(
      { name: data.name },
      {
        onSuccess: () => {
          setShow(false);
        },
      }
    );
  };

  return (
    <Modal showModal={show} setShowModal={setShow}>
      <div className="flex flex-col items-center justify-center space-y-4 border-b border-border">
        <div className="flex flex-col space-y-1 items-center justify-center px-4 py-8 sm:px-16 sm:py-8 w-full">
          <img src="/logo.png" className="size-15" />
          <h3 className="font-medium text-lg">Create Workspace</h3>
          <p className="text-neutral-500 text-sm text-center">
            Create a workspace to collaborate with your team
          </p>
        </div>
      </div>
      <div className="bg-accent/50 flex flex-col gap-y-4 px-4 py-8 sm:px-16 sm:py-8 items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-6 w-full"
        >
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium">Workspace name</p>
            <Input
              autoFocus
              placeholder="Workspace name"
              {...register("name", { required: "Workspace name is required" })}
            />
          </div>
          <Button
            Initial="Create Workspace"
            disabled={!isDirty || !isValid}
            isSubmitting={isSubmitting}
            Loading="Create Workspace"
          />
        </form>
      </div>
    </Modal>
  );
}

function CreateWorkspaceButton({
  setShow,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Button
      className="w-fit gap-1.5"
      onClick={() => {
        setShow(true);
      }}
    >
      <Plus className="size-4" />
      Create Workspace
    </Button>
  );
}

export function useAddWorkspaceModal() {
  const [show, setShow] = useState(false);

  const CreateWorkspaceButtonCallback = useCallback(
    () => <CreateWorkspaceButton setShow={setShow} />,
    [setShow]
  );

  const AddWorkspaceModalCallback = useCallback(() => {
    return <AddWorkspaceModal show={show} setShow={setShow} />;
  }, [show, setShow]);

  return useMemo(
    () => ({
      CreateWorkspaceButton: CreateWorkspaceButtonCallback,
      AddWorkspaceModal: AddWorkspaceModalCallback,
    }),
    [setShow, CreateWorkspaceButtonCallback, AddWorkspaceModalCallback]
  );
}
