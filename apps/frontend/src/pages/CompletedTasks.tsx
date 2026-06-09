import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCompletedTodos } from "@/hooks/use-todos";
import { ChevronRight } from "lucide-react";
import TaskList from "@/components/TaskList";
import EmptyState from "@/components/EmptyState";
import { useTaskSelectionContext } from "@/context/TaskSelectionContext";
import PageContentHeader from "@/layouts/PageContentHeader";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import TagCardPlaceholder from "@/features/tags/components/TagCardPlaceholder";

function CompletedTasks() {
  const { data: groups, isLoading } = useCompletedTodos();
  const { setIsSelectMode, setSelectedTaskIds } = useTaskSelectionContext();

  const totalCount =
    groups?.reduce((sum, group) => sum + group.todos.length, 0) ?? 0;

  return (
    <div>
      <PageContentHeader
        title={
          <span className="flex items-center gap-2">
            Completed
            {totalCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {totalCount}
              </span>
            )}
          </span>
        }
      />
      <PageWidthWrapper>
        <div className="py-4 pl-8">
          {isLoading &&
            Array.from({ length: 5 }, (_, index) => (
              <TagCardPlaceholder key={index} />
            ))}

          {!isLoading && (!groups || groups.length === 0) && (
            <EmptyState
              icon={
                <div className="h-5 w-5 rounded-full border border-neutral-300 bg-neutral-50 flex-none" />
              }
              title="No completed tasks"
              description="Tasks you complete will appear here"
            />
          )}

          {groups && groups.length > 0 && (
            <Accordion
              type="multiple"
              defaultValue={groups.map((g) => g.label)}
            >
              {groups.map((group) => (
                <AccordionItem key={group.label} value={group.label}>
                  <AccordionTrigger className="group relative border-b">
                    <div className="flex gap-2 items-center">
                      <ChevronRight
                        size={25}
                        className="group-data-[state=open]:rotate-90 hover:cursor-pointer p-1 hover:bg-accent rounded-md absolute top-4 -left-8"
                      />
                      <div className="font-bold">{group.label}</div>
                      <span className="text-sm font-normal text-muted-foreground">
                        {group.todos.length}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {group.todos.map((todo) => (
                      <TaskList
                        key={todo.id}
                        todo={todo}
                        taskCompleted
                        onSelect={(todoId) => {
                          setIsSelectMode(true);
                          setSelectedTaskIds((prev) => {
                            if (prev.includes(todoId)) {
                              return prev.filter((id) => id !== todoId);
                            }
                            return [...prev, todoId];
                          });
                        }}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </PageWidthWrapper>
    </div>
  );
}

export default CompletedTasks;
