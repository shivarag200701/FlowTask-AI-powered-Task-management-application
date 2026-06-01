import InlineTaskForm from "@/components/InlineTaskForm";
import TaskBuilderProvider from "@/components/task-builder-provider";
import TaskList from "@/components/TaskList";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-projects";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { CirclePlus } from "lucide-react";
import { useState } from "react";

function ListView({ id }: { id: string }) {
  const [isAddTodoOpen, setIsAddTodoOpen] = useState(false);

  const { data: project } = useProject(id);

  return (
    <PageWidthWrapper className="max-w-4xl pt-10">
      <h1 className="text-3xl font-semibold">{project?.name}</h1>
      <div className="mt-5">
        {project?.todos.map((todo) => (
          <TaskList
            key={todo.id}
            todo={todo}
            projectId={id}
            // onSelect={(todoId) => {
            //   setIsSelectMode(true);
            //   setSelectedTaskIds((prev) => {
            //     if (prev.includes(todoId)) {
            //       return prev.filter((id) => id !== todoId);
            //     }
            //     return [...prev, todoId];
            //   });
            // }}
          />
        ))}
        {!isAddTodoOpen ? (
          <Button
            variant="outline"
            className="flex justify-start border-none shadow-none hover:text-primary gap-2"
            onClick={() => {
              setIsAddTodoOpen(true);
            }}
          >
            <CirclePlus />
            Add Task
          </Button>
        ) : (
          <TaskBuilderProvider>
            <InlineTaskForm setIsOpen={setIsAddTodoOpen} />
          </TaskBuilderProvider>
        )}
      </div>
    </PageWidthWrapper>
  );
}

export default ListView;
