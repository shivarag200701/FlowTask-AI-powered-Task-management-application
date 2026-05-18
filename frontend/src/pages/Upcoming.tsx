import BoardView from "@/features/upcoming/components/BoardView";
import TaskPaginationControls from "@/features/upcoming/components/TaskPaginationControls";
import { useUpcomingDateRange } from "@/hooks/use-upcoming-date-range";
import PageContentHeader from "@/layouts/PageContentHeader";

function Upcoming() {
  const { dateRange, navigateNext, navigatePrevious, navigateToToday } =
    useUpcomingDateRange(7);
  return (
    <div>
      <PageContentHeader
        title="Upcoming"
        controls={
          <TaskPaginationControls
            navigateNext={navigateNext}
            navigatePrevious={navigatePrevious}
            navigateToToday={navigateToToday}
          />
        }
      />
      <BoardView dateRange={dateRange} />
    </div>
  );
}

export default Upcoming;
