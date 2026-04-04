import { useState } from "react";
import { Popover } from "../ui/popover";
import { Button } from "../ui/button";
import { useTaskDisplayContext } from "@/context/TaskDisplayContext";
import { ChevronDown, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Layout from "./Layout";

function TaskDisplaySelector() {
  const { viewMode, setViewMode } = useTaskDisplayContext();
  const [isopen, setIsOpen] = useState(false);
  return (
    <Popover
      openPopover={isopen}
      setOpenPopover={setIsOpen}
      content={<DisplaySettingsDropdown />}
      sideOffset={4}
      popoverContentClassName="shadow-md"
    >
      <Button
        variant="outline"
        className={cn("p-2 flex items-center justify-center", {
          "bg-accent": isopen,
        })}
      >
        <div className="flex w-full gap-2  items-center">
          <Settings2 />
          <p>Display</p>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-neutral-400 transition-transform",
              "data-[state=open]:bg-accent data-[state=open]:shadow-sm",
            )}
          />
        </div>
      </Button>
    </Popover>
  );
}

function DisplaySettingsDropdown() {
  return (
    <form className="w-full">
      <Layout />
      hi there
    </form>
  );
}
export default TaskDisplaySelector;
