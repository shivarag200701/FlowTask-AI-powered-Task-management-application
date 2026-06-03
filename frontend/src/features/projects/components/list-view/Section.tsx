import TaskList from "@/components/TaskList";
import type { SectionWithDateTime } from "@/types";
import { ChevronRight, CirclePlus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import TaskBuilderProvider from "@/components/task-builder-provider";
import InlineTaskForm from "@/components/InlineTaskForm";
import { Button } from "@/components/ui/button";
import { AddEditSection } from "../AddEditSection";

function Section({
  section,
  projectId,
}: {
  section: SectionWithDateTime;
  projectId: string;
}) {
  const [isAddTodoOpen, setIsAddTodoOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value={section.name}>
          <AccordionTrigger className="group relative border-b">
            <div className="flex gap-2 items-center">
              <ChevronRight
                size={25}
                className="group-data-[state=open]:rotate-90 hover:cursor-pointer p-1 hover:bg-accent rounded-md absolute top-4 -left-8"
              />
              <div className="font-bold">
                {section.name}{" "}
                <span className="text-neutral-400 text-xs ml-2 font-light">
                  {section.todos.length}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {section.todos &&
              section.todos.map((todo) => (
                <TaskList
                  key={todo.id}
                  todo={todo}
                  projectId={projectId}
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
                <InlineTaskForm
                  setIsOpen={setIsAddTodoOpen}
                  sectionId={section.id}
                />
              </TaskBuilderProvider>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {isAddSectionOpen ? (
        <AddEditSection
          setIsAddSectionOpen={setIsAddSectionOpen}
          projectId={projectId}
          className="w-full"
        />
      ) : (
        <button
          className="group cursor-pointer h-4 mt-2 flex items-center opacity-0 hover:opacity-100"
          onClick={() => setIsAddSectionOpen(true)}
        >
          <div className="flex-1 h-0.5 bg-primary"></div>
          <span className="px-2 text-sm text-primary font-medium whitespace-nowrap">
            Add section
          </span>
          <div className="flex-1 h-0.5 bg-primary"></div>
        </button>
      )}
    </>
  );
}

export default Section;
