import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Modal } from "../ui/modal";
import TagsSelector from "../pill-buttons/TagsSelector";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "../ui/button";
import { useWatch } from "react-hook-form";
import { useBulkUpdateTodos } from "@/hooks/use-todos";
import { useTaskSelectionContext } from "@/context/TaskSelectionContext";
import type { TagProps } from "@/types";

type TagTodoProps = {};

export function TagTodoModal({
  showTagTodoModal,
  setShowTagTodoModal,
}: TagTodoProps & {
  showTagTodoModal: boolean;
  setShowTagTodoModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [tagSelectorOpen, setTagSelectorOpen] = useState(false);

  const { selectedTaskIds } = useTaskSelectionContext();

  const form = useForm({
    defaultValues: { tags: [] },
  });

  const tags: TagProps[] = useWatch({ control: form.control, name: "tags" });

  const tagIds = tags.map((tag) => tag.id);

  const { mutate: updateTodos, isPending } = useBulkUpdateTodos();

  const numberOfTodos = useMemo(() => {
    return selectedTaskIds.length;
  }, [selectedTaskIds]);

  return (
    <FormProvider {...form}>
      <Modal showModal={showTagTodoModal} setShowModal={setShowTagTodoModal}>
        <div className="p-4 sm:p-6 flex items-center justify-start border-b border-border">
          <h3 className="text-lg font-medium">
            Update tags for {numberOfTodos} links
          </h3>
        </div>
        <div className="p-4 sm:p-6 flex items-center w-full bg-accent/50 border-b border-border">
          <div className="flex flex-col space-y-1 w-full">
            <p className="text-sm font-medium">Tags</p>
            <TagsSelector open={tagSelectorOpen} setOpen={setTagSelectorOpen} />
          </div>
        </div>
        <div className="p-4 sm:p-6 flex items-center justify-end gap-2 bg-accent/50">
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => {
              setShowTagTodoModal(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            type="button"
            className="w-fit"
            isSubmitting={isPending}
            onClick={() => {
              updateTodos({ tags: tagIds, todoIds: selectedTaskIds });
              setShowTagTodoModal(false);
            }}
          >
            Update tags
          </Button>
        </div>
      </Modal>
    </FormProvider>
  );
}

export function useTagTodoModal() {
  const [showTagTodoModal, setShowTagTodoModal] = useState(false);

  return {
    setShowTagTodoModal,
    TagTodoModal: (
      <TagTodoModal
        showTagTodoModal={showTagTodoModal}
        setShowTagTodoModal={setShowTagTodoModal}
      />
    ),
  };
}
