import TaskDisplaySelector from "@/components/TaskDisplaySelector";
import { Button } from "@/components/ui/button";
import { useTodayTodos } from "@/hooks/use-todos";
import PageContentHeader from "@/layouts/PageContentHeader";
import { useNavigate } from "react-router-dom";

function Upcoming() {
  const { data: todos } = useTodayTodos();
  const navigate = useNavigate();

  return (
    <div>
      <PageContentHeader title="Upcoming" controls={<TaskDisplaySelector />} />
      <Button
        Initial="Go to today"
        onClick={() => {
          navigate("/app/today");
        }}
      />
    </div>
  );
}

export default Upcoming;
