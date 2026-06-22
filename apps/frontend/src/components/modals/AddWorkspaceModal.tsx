import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  useCheckWorkspaceSlug,
  useCreateWorkspace,
  useWorkspaces,
} from "@/hooks/use-workspaces";
import { AlertCircle, Plus } from "lucide-react";
import ImageUpload from "@/features/auth/onboarding/ImageUpload";
import { FileUploadTrigger } from "@/components/ui/file-upload";
import { createSlug } from "@shiva200701/todotypes";
import { useUserProfile } from "@/hooks/use-users";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type FormValues = {
  name: string;
  slug: string;
  logo?: File;
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
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isValid, isSubmitting, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const { mutateAsync: createWorkspace } = useCreateWorkspace();
  const {
    mutateAsync: checkSlug,
    data,
    reset,
    error,
  } = useCheckWorkspaceSlug();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("slug", data.slug);
    if (data.logo) {
      formData.append("image", data.logo);
    }
    await createWorkspace(formData, {
      onSuccess: () => {
        setShow(false);
      },
    });
  };
  const workspaceName = watch("name");
  useEffect(() => {
    setValue("slug", createSlug(workspaceName));
  }, [workspaceName, setValue]);

  return (
    <Modal showModal={show} setShowModal={setShow}>
      <div className="flex flex-col items-center justify-center space-y-4 border-b border-border">
        <div className="flex flex-col space-y-1 items-center justify-center px-4 py-8 sm:px-12 sm:pt-6 sm:pb-4 w-full">
          <img src="/logo.png" className="size-15" />
          <h3 className="font-medium text-lg">Create a Workspace</h3>
          <p className="text-neutral-500 text-xs text-center cursor-pointer text-balance">
            Set up a common space to manage your tasks with your team.{" "}
            <span className="underline cursor-help decoration-dotted">
              Learn more
            </span>
          </p>
        </div>
      </div>
      <div className="bg-accent/50 flex flex-col gap-y-4 px-4 py-8 sm:px-16 sm:py-8 items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-6 w-full"
        >
          <div className="flex flex-col   gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Workspace name</p>
              <Input
                autoFocus
                placeholder="Acme, Inc."
                {...register("name", {
                  required: "Workspace name is required",
                })}
              />
              <p className="text-xs text-neutral-500">
                This is the name of your team or organization.{" "}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Workspace slug</p>
              <div className="w-full flex">
                <Input
                  className={`rounded-r-none w-2/3 bg-neutral-200 `}
                  disabled
                  value={window.location.origin}
                />
                <div className="relative w-full">
                  <Input
                    placeholder="acme"
                    className={`rounded-l-none ${error ? "border-2 border-red-500 pr-9" : ""}`}
                    {...register("slug", {
                      required: "slug is required",
                      onChange: () => reset(),
                      onBlur: () => {
                        const slug = getValues("slug");
                        if (slug) checkSlug({ slug: getValues("slug") });
                      },
                    })}
                  />
                  {error && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AlertCircle className="size-4 text-red-500" />
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-neutral-500">
                {error?.response?.data?.msg ? (
                  <span className="text-red-500">
                    {error.response.data.msg}
                  </span>
                ) : data ? (
                  <span className="text-emerald-600">{data.data.msg}</span>
                ) : (
                  "This is your workspace's URL namespace on FlowTask."
                )}
              </p>
            </div>
            <p className="text-sm font-medium">Workspace logo</p>
            <Controller
              control={control}
              name="logo"
              render={({ field }) => (
                <ImageUpload
                  onChange={field.onChange}
                  dropZoneClassname="h-25 w-25"
                >
                  <div className="flex flex-col gap-2 justify-center">
                    <FileUploadTrigger asChild>
                      <Button
                        variant="outline"
                        size="xs"
                        className="w-fit py-3"
                        type="button"
                      >
                        Upload image
                      </Button>
                    </FileUploadTrigger>
                    <p className="text-xs text-neutral-500">
                      Maximum file size: 5MB
                    </p>
                  </div>
                </ImageUpload>
              )}
            />
          </div>
          <Button
            Initial="Create Workspace"
            disabled={!isDirty || !isValid || !!error}
            isSubmitting={isSubmitting}
            Loading="Create Workspace"
            size="lg"
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
  const { data: workspaces } = useWorkspaces();
  const { data: user } = useUserProfile();

  const workspacesCount =
    workspaces?.filter((workspace) => workspace.createdBy === user?.id)
      .length ?? 0;

  const isAtLimit = workspacesCount >= 1;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="w-fit gap-1.5"
          onClick={() => {
            setShow(true);
          }}
          disabled={isAtLimit}
        >
          <Plus className="size-4" />
          Create Workspace
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="center"
        sideOffset={5}
        hidden={!isAtLimit}
      >
        <span className="text-sm">
          You've reached the maximum number of workspaces
        </span>
      </TooltipContent>
    </Tooltip>
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
