import { useAddEditTagModal } from "@/components/modals/AddEditTagModal";
import AnimatedScrollContainer from "@/components/ui/animated-scroll-container";

function NoTags() {
  const { CreateTagButton, AddEditTagModal } = useAddEditTagModal();
  return (
    <div className=" w-full py-10 px-4 gap-y-6 sm:h-[500px] border border-border rounded-md flex flex-col items-center  justify-center overflow-hidden">
      <div className="h-[144px] overflow-hidden">
        <AnimatedScrollContainer />
      </div>
      <div className="text-center">
        <div className="text-base font-medium text-neutral-900">
          No tags found
        </div>
        <p className="text-sm text-neutral-500 mt-2">
          Create tags to organize your links
        </p>
      </div>
      <div className="flex gap-2">
        <CreateTagButton />
      </div>
      <AddEditTagModal />
    </div>
  );
}
export default NoTags;
