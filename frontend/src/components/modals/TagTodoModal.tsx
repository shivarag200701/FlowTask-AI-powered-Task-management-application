import { useState, type Dispatch, type SetStateAction } from "react";
import { Modal } from "../ui/modal";
import TagsSelector from "../pill-buttons/TagsSelector";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "../ui/button";

type TagTodoProps = {};

export function TagTodoModal({
  showTagTodoModal,
  setShowTagTodoModal,
}: TagTodoProps & {
  showTagTodoModal: boolean;
  setShowTagTodoModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [tagSelectorOpen, setTagSelectorOpen] = useState(false);

  const form = useForm({
    defaultValues: { tags: [] },
  });

  return (
    <FormProvider {...form}>
      <Modal showModal={showTagTodoModal} setShowModal={setShowTagTodoModal}>
        <div className="p-4 sm:p-6 flex items-center justify-start border-b border-border">
          <h3 className="text-lg font-medium">Update tags for 4 links</h3>
        </div>
        <div className="p-4 sm:p-6 flex items-center w-full bg-accent/50 border-b border-border">
          <div className="flex flex-col space-y-2 w-full">
            <p className="text-sm font-medium">Tags</p>
            <TagsSelector open={tagSelectorOpen} setOpen={setTagSelectorOpen} />
          </div>
        </div>
        <div className="p-4 sm:p-6 flex items-center justify-end gap-2 bg-accent/50">
          <Button variant="outline" className="w-fit">
            Cancel
          </Button>
          <Button variant="default" className="w-fit">
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
