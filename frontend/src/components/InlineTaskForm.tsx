import type { TodoWithCompleteAtDateTime } from "@/types";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "./ui/button";
import { Popover } from "./ui/popover";
import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import PriorityDisplayer from "@/components/pill-buttons/PriorityDisplay";
import ReminderDisplayer from "@/components/pill-buttons/ReminderDisplayer";
import TagsSelector from "@/components/pill-buttons/TagsSelector";
import TagDropDown from "./popovers/TagDropDown";
import ComboBox from "./ComboBox";
import { useHotkeys } from "react-hotkeys-hook";

type Inputs = {
  taskName: string;
  description?: string;
};

function InlineTaskForm({
  todo,
  setIsOpen,
}: {
  todo?: TodoWithCompleteAtDateTime;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, isValid },
  } = useForm<Inputs>({
    defaultValues: {
      taskName: todo ? todo.title : "",
      description: todo ? todo.description : "",
    },
  });

  useHotkeys(
    "t",
    () => {
      setIsTagsDropDownOpen(true);
    },
    { preventDefault: true },
  );

  const [isPriorityDropDownOpen, setIsPriorityDropDownOpen] = useState(false);
  const [isReminderDropDownOpen, setIsReminderDropDownOpen] = useState(false);
  const [isTagsDropDownOpen, setIsTagsDropDownOpen] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data);
  };

  return (
    <div className="rounded-lg border border-border  min-h-15">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border-b border-border/50  px-3 py-2">
          <input
            className="font-semibold w-full border-none focus:outline-none"
            style={{ fontSize: "14px" }}
            placeholder="Task name"
            {...register("taskName", {
              required: "title is required",
            })}
          />
          <input
            className="w-full border-none focus:outline-none"
            style={{ fontSize: "13px" }}
            placeholder="Description"
            {...register("description")}
          />
          <div className="flex gap-2 mt-4">
            <Popover
              openPopover={isPriorityDropDownOpen}
              setOpenPopover={setIsPriorityDropDownOpen}
              content={<div>HI there fools</div>}
            >
              <PriorityDisplayer priority={todo?.priority ?? null} />
            </Popover>
            <Popover
              openPopover={isReminderDropDownOpen}
              setOpenPopover={setIsReminderDropDownOpen}
              content={<div>Reminder</div>}
            >
              <ReminderDisplayer remimder={todo?.reminder} />
            </Popover>
            {/* <Popover
              openPopover={isTagsDropDownOpen}
              setOpenPopover={setIsTagsDropDownOpen}
              content={<TagDropDown />}
            >
              <TagsSelector />
            </Popover> */}
            <TagsSelector
              open={isTagsDropDownOpen}
              setOpen={setIsTagsDropDownOpen}
            />
          </div>
        </div>
        <div className="w-full p-3 flex justify-end gap-2">
          <Button
            variant="secondary"
            className="w-fit"
            Initial="Cancel"
            onClick={() => {
              setIsOpen(false);
            }}
            type="button"
          />
          <Button
            variant="default"
            className="w-fit"
            Initial="Add Task"
            disabled={!isValid}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}
export default InlineTaskForm;
