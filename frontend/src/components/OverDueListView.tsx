import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useOverDueTodos } from "@/hooks/use-todos";
import { ChevronRight } from "lucide-react";
import TaskList from "./TaskList";
import { useTaskSelectionContext } from "@/context/TaskSelectionContext";

function OverViewListView() {
  const { data: overdueTasks } = useOverDueTodos();
  const { setIsSelectMode, setSelectedTaskIds } = useTaskSelectionContext();

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="overdue">
        <AccordionTrigger className="group relative border-b">
          <div className="flex gap-2 items-center">
            <ChevronRight
              size={25}
              className="group-data-[state=open]:rotate-90 hover:cursor-pointer p-1 hover:bg-accent rounded-md absolute top-4 -left-8"
            />
            <div className="font-bold">Overdue</div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {overdueTasks &&
            overdueTasks.map((todo) => (
              <TaskList
                key={todo.id}
                todo={todo}
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
    </Accordion>
  );
}

export default OverViewListView;
