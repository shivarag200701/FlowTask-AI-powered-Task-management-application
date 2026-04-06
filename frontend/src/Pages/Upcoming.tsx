import TaskDisplaySelector from "@/components/TaskDisplaySelector";
import { Button } from "@/components/ui/button";
import { useTodayTodos } from "@/hooks/use-today-todos";
import PageContentHeader from "@/layouts/PageContentHeader";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface TodayProps {
  className?: string;
}

function Upcoming({ className }: TodayProps) {
  const { data: todos } = useTodayTodos();
  const navigate = useNavigate();

  return (
    <div className={cn(`bg-neutral-200 w-full lg:py-2 lg:pr-2`, className)}>
      {/* create compoent for header*/}
      <div className="bg-white h-full lg:rounded-xl">
        <PageContentHeader
          title="Upcoming"
          controls={<TaskDisplaySelector />}
        />
        <Button
          Initial="Go to today"
          onClick={() => {
            navigate("/app/today");
          }}
        />
      </div>
    </div>
  );
}

export default Upcoming;
