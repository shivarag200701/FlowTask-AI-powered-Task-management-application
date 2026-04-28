import type { TodoWithCompleteAtDateTime } from "@/types";
import { useFormContext, useWatch, type SubmitHandler } from "react-hook-form";
import { Button } from "./ui/button";
import { Popover } from "./ui/popover";
import { useState, type Dispatch, type SetStateAction } from "react";
import PriorityDisplayer from "@/components/pill-buttons/PriorityDisplay";
import ReminderDisplayer from "@/components/pill-buttons/ReminderDisplayer";
import TagsSelector from "@/components/pill-buttons/TagsSelector";
import { useHotkeys } from "react-hotkeys-hook";
import type { CreateTodo } from "@shiva200701/todotypes";
import PriorityDropDown from "./popovers/PriorityDropDown";
import { useCreateTodo } from "@/hooks/use-todos";
import { DateTime } from "luxon";
import { useDateTimeModal } from "./modals/DateTimeModal";
import { SpinnerCustom } from "./ui/spinner";

function InlineTaskForm({
  todo,
  setIsOpen,
}: {
  todo?: TodoWithCompleteAtDateTime;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    control,
    setValue,
    register,
    formState: { isValid },
    handleSubmit,
  } = useFormContext<CreateTodo>();

  const { mutate } = useCreateTodo();

  const [tags, title, description] = useWatch({
    control,
    name: ["tags", "title", "description"],
  });

  const {
    DateTimeButton,
    DateTimeModal,
    setShowDateTimeModal,
    showDateTimeModal,
  } = useDateTimeModal();

  useHotkeys(
    "t",
    () => {
      setIsTagsDropDownOpen(true);
    },
    { preventDefault: true, enabled: !showDateTimeModal },
  );

  useHotkeys(
    "d",
    () => {
      setShowDateTimeModal(true);
    },
    { preventDefault: true },
  );

  const [isPriorityDropDownOpen, setIsPriorityDropDownOpen] = useState(false);
  const [isReminderDropDownOpen, setIsReminderDropDownOpen] = useState(false);
  const [isTagsDropDownOpen, setIsTagsDropDownOpen] = useState(false);

  const onSubmit: SubmitHandler<CreateTodo> = (data) => {
    //mock- change later to selected date

    data.tags = data.tags?.map((tag) => tag.id);
    console.log(data);

    const today = DateTime.now().toISODate();
    data.dueDate = today;
    mutate(data);
  };

  return (
    <div className="rounded-lg border border-border min-h-15 ">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border-b border-border/50  px-3 py-2">
          <input
            className="font-semibold w-full border-none focus:outline-none"
            style={{ fontSize: "14px" }}
            placeholder="Task name"
            {...register("title", {
              required: "title is required",
            })}
          />
          <input
            className="w-full border-none focus:outline-none"
            style={{ fontSize: "14px" }}
            placeholder="Description"
            {...register("description")}
          />
          <div className="grid grid-cols-2 md:flex gap-2 mt-4">
            <DateTimeButton />
            <Popover
              openPopover={isPriorityDropDownOpen}
              setOpenPopover={setIsPriorityDropDownOpen}
              content={<PriorityDropDown />}
            >
              <PriorityDisplayer />
            </Popover>
            <Popover
              openPopover={isReminderDropDownOpen}
              setOpenPopover={setIsReminderDropDownOpen}
              content={<div>Reminder</div>}
            >
              <ReminderDisplayer remimder={todo?.reminder} />
            </Popover>
            <div className="col-span-2 w-full">
              <TagsSelector
                open={isTagsDropDownOpen}
                setOpen={setIsTagsDropDownOpen}
              />
            </div>
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
        <DateTimeModal />
      </form>
    </div>
  );
}
export default InlineTaskForm;
