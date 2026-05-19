import BoardView from "@/features/upcoming/components/BoardView";
import TaskPaginationControls from "@/features/upcoming/components/TaskPaginationControls";
import { useUpcomingDateRange } from "@/hooks/use-upcoming-date-range";
import PageContentHeader from "@/layouts/PageContentHeader";

function Upcoming() {
  const {
    dateRange,
    navigateNext,
    navigatePrevious,
    navigateToToday,
    previousDisabled,
  } = useUpcomingDateRange(7);

  return (
    <div>
      <PageContentHeader
        title="Upcoming"
        controls={
          <TaskPaginationControls
            navigateNext={navigateNext}
            navigatePrevious={navigatePrevious}
            navigateToToday={navigateToToday}
            previousDisabled={previousDisabled}
          />
        }
      />
      {/*Implement list view in next feature rollouts */}
      {/* <div className="px-5 md:px-6 pt-5 flex w-full gap-2">
        <TaskDisplaySelector className="sm:w-fit w-1/2  px-5 h-10" />
      </div> */}
      <BoardView dateRange={dateRange} />
    </div>
  );
}

export default Upcoming;
