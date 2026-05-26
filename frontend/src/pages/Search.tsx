import PageContentHeader from "@/layouts/PageContentHeader";
import PageWidthWrapper from "@/layouts/PageWidthWrapper";
import { TabSwitcher } from "@/components/ui/tab-switcher";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSearchTodos, useTodos } from "@/hooks/use-todos";
import TaskList from "@/components/TaskList";
import EmptyState from "@/components/EmptyState";

const tabs = ["Tasks", "Comments"] as const;
type Tab = (typeof tabs)[number];

export default function Search() {
  const { "*": searchQuery } = useParams();
  const [selectedTab, setSelectedTab] = useState<Tab>("Tasks");
  const { data: searchResults } = useSearchTodos(searchQuery ?? "");
  const { data: allTodos } = useTodos();

  const matchedTodos = useMemo(() => {
    if (!searchResults || !allTodos) return [];
    const resultIds = new Set(searchResults.map((r) => r.id));
    return allTodos.filter((todo) => resultIds.has(todo.id));
  }, [searchResults, allTodos]);

  return (
    <>
      <PageContentHeader title="Search" />
      <PageWidthWrapper className="grid pt-6 lg:pt-15 px-10 lg:px-20">
        <h1 className="font-bold text-2xl pb-5">
          Results for &ldquo;{searchQuery}&rdquo;
        </h1>
        <TabSwitcher
          tabs={tabs}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />
        <div className="mt-4">
          {selectedTab === "Tasks" && (
            <>
              {matchedTodos.length > 0 ? (
                matchedTodos.map((todo) => (
                  <TaskList
                    key={todo.id}
                    todo={todo}
                    taskCompleted={todo.completed}
                  />
                ))
              ) : (
                <EmptyState
                  title="No results found"
                  description={`We couldn't find any tasks matching "${searchQuery}"`}
                  icon={
                    <div className="h-5 w-5 rounded-full border border-neutral-300 bg-neutral-50 flex-none" />
                  }
                />
              )}
            </>
          )}
        </div>
      </PageWidthWrapper>
    </>
  );
}
