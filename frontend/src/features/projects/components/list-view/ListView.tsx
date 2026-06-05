import {
  useNoSectionProjectTodos,
  useProject,
  useProjectSections,
} from "@/hooks/use-projects";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import Section from "./Section";
import TaskList from "@/components/TaskList";
import { useTaskSelectionContext } from "@/context/TaskSelectionContext";

function ListView({ id }: { id: string }) {
  const { data: project } = useProject(id);
  const { data: sections } = useProjectSections(id);
  const { data: noSection } = useNoSectionProjectTodos(id);
  const { setIsSelectMode, setSelectedTaskIds } = useTaskSelectionContext();

  const handleSelect = (todoId: string) => {
    setIsSelectMode(true);
    setSelectedTaskIds((prev) => {
      if (prev.includes(todoId)) {
        return prev.filter((id) => id !== todoId);
      }
      return [...prev, todoId];
    });
  };

  return (
    <PageWidthWrapper className="max-w-5xl p-10">
      <h1 className="text-3xl font-semibold">{project?.name}</h1>
      <div className="mt-5 flex flex-col gap-2 ">
        {noSection && noSection.todos.length > 0 && (
          <div className="flex flex-col">
            {noSection.todos.map((todo) => (
              <TaskList
                key={todo.id}
                todo={todo}
                projectId={id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
        {sections?.map((section) => (
          <Section key={section.id} section={section} projectId={id} />
        ))}
      </div>
    </PageWidthWrapper>
  );
}

export default ListView;
