import TaskDisplaySelector from "@/components/TaskDisplaySelector";
import { Button } from "@/components/ui/button";
import PageContentHeader from "@/layouts/PageContentHeader";
import { useNavigate } from "react-router-dom";

function Upcoming() {
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
