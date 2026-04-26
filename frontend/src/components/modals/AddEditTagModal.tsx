import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Kbd } from "../ui/kbd";
import { useHotkeys } from "react-hotkeys-hook";
import { Input } from "../ui/input";
import {
  RESOURCE_COLORS,
  type ResourceColorsEnum,
} from "@shiva200701/todotypes";
import TagBadge from "../TagBadge";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { cn } from "@/lib/utils";
import { useCreateTags, useUpdateTags } from "@/hooks/use-tags";
import type { TagProps, TodoTag } from "@/types";

type FormValues = {
  name: string;
  color: ResourceColorsEnum;
};

function AddEditTagModal({
  show,
  setShow,
  tag,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  tag?: TodoTag;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name: tag ? tag.name : "",
      color: tag ? tag.color : RESOURCE_COLORS[0],
    },
  });

  const { mutateAsync: CreateTag } = useCreateTags();
  const { mutateAsync: updatedTag } = useUpdateTags();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!isEditing) {
      await CreateTag(data, {
        onSuccess: () => {
          setShow(false);
        },
      });
      return;
    }
    if (tag?.id) await updatedTag({ id: tag?.id, tag: data });
  };

  const isEditing = useMemo(() => {
    if (tag && tag.id) {
      return true;
    } else {
      return false;
    }
  }, [tag?.id]);

  return (
    <Modal showModal={show} setShowModal={setShow} className="">
      <div className="flex flex-col items-center justify-center space-y-4 border-b border-border">
        <div className="flex flex-col space-y-1 items-center justify-center px-4 py-8 sm:px-16 sm:py-8 w-full">
          <img src="/logo.png" className="size-15" />
          <h3 className="font-medium text-lg">Create tag</h3>
          <p className="text-neutral-500 text-sm">
            Use tags to organize your links
          </p>
        </div>
      </div>
      <div className="bg-accent/50 flex flex-col gap-y-4 px-4 py-8 sm:px-16 sm:py-8 items-center justify-center">
        <form
          className="flex flex-col space-y-6 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium">Tag name</p>
            <Input
              placeholder="New Tag"
              {...register("name", { required: "tag name is required" })}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium">Tag color</p>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {RESOURCE_COLORS.map((color) => (
                    <div onClick={() => field.onChange(color)}>
                      <TagBadge
                        color={color}
                        key={color}
                        name={color}
                        className={cn(
                          field.value === color && "ring-2",
                          "px-2 py-1 text-sm",
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}
            />
          </div>
          <Button
            Initial={`${tag ? "Save Changes" : "Create Tag"}`}
            disabled={!!tag ? !isValid || !isDirty : !isValid}
            isSubmitting={isSubmitting}
            Loading="Create Tag"
          />
        </form>
      </div>
    </Modal>
  );
}

function CreateTagButton({
  setShow,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  useHotkeys("c", () => {
    setShow(true);
  });
  return (
    <Button
      Initial="Create tag"
      onClick={() => {
        setShow(true);
      }}
      className="hover:ring-4 hover:ring-border/70 hover:text-accent"
    >
      <Kbd>C</Kbd>
    </Button>
  );
}

export function useAddEditTagModal(tag?: TagProps) {
  const [show, setShow] = useState(false);
  const AddEditTagModalCallback = useCallback(() => {
    return <AddEditTagModal show={show} setShow={setShow} tag={tag} />;
  }, [show, setShow]);

  const CreateTagButtonCallback = useCallback(() => {
    return <CreateTagButton setShow={setShow} />;
  }, [setShow]);

  return useMemo(
    () => ({
      setShowAddEditTagModal: setShow,
      AddEditTagModal: AddEditTagModalCallback,
      CreateTagButton: CreateTagButtonCallback,
    }),
    [setShow, AddEditTagModalCallback, CreateTagButtonCallback],
  );
}

export default AddEditTagModal;
