import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useOverDueTodos } from "@/hooks/use-todos";
import { ChevronRight } from "lucide-react";

function OverViewListView() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="overdue">
        <AccordionTrigger className="group relative border-b">
          <div className="flex gap-2 items-center">
            <ChevronRight
              size={25}
              className="group-data-[state=open]:rotate-90 hover:cursor-pointer p-1 hover:bg-accent rounded-md absolute top-4 -left-10"
            />
            <div className="font-bold">Overdue</div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <List />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function List() {
  const { data: overdueTasks } = useOverDueTodos();

  return (
    <div className="flex flex-col">
      {overdueTasks?.map((todo) => (
        <div className="py-2 border-b flex gap-2 items-start h-15">
          <div className="h-4 w-4 rounded-full border" />
          <div className="flex flex-col">
            <div>{todo.title}</div>
            <div className="text-xs">{todo.dueDate}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OverViewListView;
