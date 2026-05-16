import { Button } from "@/components/ui/button";
import { useOverDueTodos, useUpcomingTodos } from "@/hooks/use-todos";
import { useUpcomingDateRange } from "@/hooks/use-upcoming-date-range";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import type { TodoWithCompleteAtDateTime } from "@/types";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

function BoardView() {
  const { data: overdueTodos } = useOverDueTodos();
  const today = DateTime.now();

  const { dateRange, navigateNext, navigatePrevious } = useUpcomingDateRange(7);
  const { data: futureTodos } = useUpcomingTodos(dateRange);

  dateRange.map((date) => console.log("date", date.toFormat("MMM d")));
  console.log(futureTodos);

  const [items, setItems] = useState<
    Record<string, TodoWithCompleteAtDateTime[]>
  >({
    Overdue: [],
  });
  useEffect(() => {
    if (!overdueTodos) return;
    setItems(() => {
      return {
        Overdue: overdueTodos,
      };
    });
  }, [overdueTodos]);
  return (
    <PageWidthWrapper className="pt-6 px-3 flex flex-col overflow-x-auto ">
      <Button
        onClick={() => {
          navigateNext();
        }}
      >
        Next
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          navigatePrevious();
        }}
      >
        Previous
      </Button>
    </PageWidthWrapper>
  );
}

export default BoardView;
