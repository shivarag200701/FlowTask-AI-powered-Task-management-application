import TaskDisplaySelector from "@/components/TaskDisplaySelector";
import BoardView from "@/features/upcoming/components/BoardView";
import PageContentHeader from "@/layouts/PageContentHeader";

function Upcoming() {
  return (
    <div>
      <PageContentHeader title="Upcoming" controls={<TaskDisplaySelector />} />
      <BoardView />
    </div>
  );
}

export default Upcoming;
