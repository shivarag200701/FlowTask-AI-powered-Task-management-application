import type { TodoWithCompleteAtDateTime } from "@/types";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";

type Inputs = {
  taskName: string;
  description?: string;
};

function InlineTaskForm({ todo }: { todo?: TodoWithCompleteAtDateTime }) {
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

  return (
    <div className="rounded-lg border border-border  min-h-15">
      <div className="border-b border-border/50  px-3 py-2">
        <form>
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
        </form>
      </div>
      <div className="w-full p-3 flex justify-end gap-2">
        <Button variant="secondary" className="w-fit" Initial="Cancel" />
        <Button
          variant="default"
          className="w-fit"
          Initial="Add Task"
          disabled={!isValid}
        />
      </div>
    </div>
  );
}
export default InlineTaskForm;
