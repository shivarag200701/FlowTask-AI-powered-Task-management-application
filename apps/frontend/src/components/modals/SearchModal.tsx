import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Modal } from "../ui/modal";
import { Command } from "cmdk";
import { Kbd } from "../ui/kbd";
import { useDebounce } from "use-debounce";
import { useSearchTodos, useTodos } from "@/hooks/use-todos";
import AnimatedSizeContainer from "../ui/animated-size-container";
import { cn } from "@/lib/utils";
import type {
  TodoSearchDocument,
  TagSearchDocument,
  ProjectSearchDocument,
} from "@shiva200701/todotypes";
import { SpinnerCustom } from "../ui/spinner";
import { CalendarDays, History, Tag, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import TodayCalendarIcon from "../TodayCalendarIcon";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { createTodoSlug } from "@/utils/functions/slug";
import { ScrollContainer } from "../ui/scroll-container";

const navigationItems = [
  { label: "Go to Today", icon: TodayCalendarIcon, path: "app/today" },
  { label: "Go to Upcoming", icon: CalendarDays, path: "app/upcoming" },
  { label: "Go to Tags", icon: Tag, path: "app/tags" },
];

function SearchModal({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue] = useDebounce(searchValue, 300);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: todos } = useTodos();

  const { data: searchData, isLoading: loading } =
    useSearchTodos(debouncedValue);

  const todoResults = searchData?.todos;
  const tagResults = searchData?.tags;
  const projectResults = searchData?.projects;

  console.log("projects", projectResults);

  const [recentSearches, setRecentSearches] = useLocalStorage<
    string[] | undefined
  >("recentSearches", undefined);

  function handleClick() {
    const updated = [
      searchValue,
      ...(recentSearches || []).filter((s) => s !== searchValue),
    ].slice(0, 5);
    setRecentSearches(updated);
    navigate(`app/search/${searchValue}`);
    setShow(false);
  }

  return (
    <Modal
      showModal={show}
      setShowModal={setShow}
      className="scrollbar-hidden max-w-xl"
    >
      <AnimatedSizeContainer height className="overflow-hidden">
        <Command shouldFilter={false}>
          <div className="relative flex items-center">
            <Command.Input
              className=" pl-4 py-3 focus:outline-none text-sm w-full"
              placeholder="search todos"
              value={searchValue}
              onValueChange={setSearchValue}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (searchValue.length > 0) handleClick();
                }
              }}
            />
            <Kbd className="absolute right-4 w-fit">⌘K</Kbd>
          </div>
          <Command.Separator
            className="border-t border-neutral-100"
            alwaysRender
          />
          <ScrollContainer className="max-h-[300px] py-2">
            {loading ? (
              <Command.Loading>
                <div className="h-12 flex items-center justify-center">
                  <SpinnerCustom />
                </div>
              </Command.Loading>
            ) : (
              <>
                {todoResults && todoResults.length > 0 && (
                  <Command.Group
                    heading="Tasks"
                    className="text-xs px-2 text-neutral-400"
                  >
                    <Command.List className=" text-neutral-900">
                      {todoResults.map((result) => (
                        <TaskOption
                          option={result}
                          key={result.id}
                          onSelect={() => {
                            const todo = todos?.find((t) => t.id === result.id);
                            if (todo) {
                              const slug = createTodoSlug(todo.title, todo.id);
                              navigate(`/app/task/${slug}`, {
                                state: {
                                  backgroundLocation: location,
                                },
                              });
                              setShow(false);
                            }
                          }}
                        />
                      ))}
                    </Command.List>
                  </Command.Group>
                )}
                {tagResults && tagResults.length > 0 && (
                  <Command.Group
                    heading="Tags"
                    className="text-xs px-2 text-neutral-400"
                  >
                    <Command.List className="text-neutral-900">
                      {tagResults.map((tag) => (
                        <TagOption
                          key={tag.id}
                          tag={tag}
                          onSelect={() => {
                            navigate(`app/todos?tagIds=${tag.id}`);
                            setShow(false);
                          }}
                        />
                      ))}
                    </Command.List>
                  </Command.Group>
                )}
                {projectResults && projectResults.length > 0 && (
                  <Command.Group
                    heading="Projects"
                    className="text-xs px-2 text-neutral-400"
                  >
                    <Command.List className="text-neutral-900">
                      {projectResults.map((project) => (
                        <ProjectOption
                          key={project.id}
                          option={project}
                          onSelect={() => {
                            navigate(`app/projects/${project.slug}`);
                            setShow(false);
                          }}
                        />
                      ))}
                    </Command.List>
                  </Command.Group>
                )}
                {(!todoResults || todoResults.length === 0) &&
                  (!tagResults || tagResults.length === 0) &&
                  (!projectResults || projectResults.length === 0) && (
                    <Command.Empty className="flex justify-center items-center h-12 text-neutral-500 text-sm">
                      No matches
                    </Command.Empty>
                  )}
              </>
            )}

            {searchValue.length === 0 &&
              recentSearches &&
              recentSearches.length > 0 && (
                <>
                  <RecentSearches
                    searches={recentSearches}
                    onSelect={(term) => {
                      setSearchValue(term);
                    }}
                    onClear={() => setRecentSearches(undefined)}
                    onRemove={(term) => {
                      const updated = recentSearches?.filter((s) => s !== term);
                      setRecentSearches(
                        updated && updated.length > 0 ? updated : undefined
                      );
                    }}
                  />
                  <Command.Separator
                    className="border-t border-neutral-100 my-1"
                    alwaysRender
                  />
                </>
              )}

            <NavigationGroup
              onNavigate={(path) => {
                navigate(path);
                setShow(false);
              }}
            />
          </ScrollContainer>
        </Command>
      </AnimatedSizeContainer>
    </Modal>
  );
}

function TagOption({
  tag,
  onSelect,
}: {
  tag: TagSearchDocument;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      className={cn(
        "hover:cursor-pointer px-1 py-2 hover:bg-accent rounded-md text-sm flex gap-3 items-center",
        "data-[selected=true]:bg-accent"
      )}
      value={`tag-${tag.id}`}
      onSelect={onSelect}
    >
      <Tag className="w-4 h-4 text-neutral-500" />
      <span>{tag.name}</span>
    </Command.Item>
  );
}

function TaskOption({
  option,
  onSelect,
}: {
  option: TodoSearchDocument;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      className={cn(
        "hover:cursor-pointer px-1 py-2 hover:bg-accent rounded-md text-sm flex gap-4 items-center justify-between",
        "data-[selected=true]:bg-accent "
      )}
      value={option.id}
      onSelect={onSelect}
    >
      <div className="flex gap-4 items-center">
        <div className="flex gap-4 items-center justify-between">
          <div className="h-4 w-4 rounded-full border" />
          <span>{option.title}</span>
        </div>
      </div>
    </Command.Item>
  );
}

function ProjectOption({
  option,
  onSelect,
}: {
  option: ProjectSearchDocument;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      className={cn(
        "hover:cursor-pointer px-1 py-2 hover:bg-accent rounded-md text-sm flex gap-4 items-center justify-between",
        "data-[selected=true]:bg-accent "
      )}
      value={option.id}
      onSelect={onSelect}
    >
      <div className="flex gap-4 items-center">
        <div className="flex gap-4 items-center justify-between">
          <div className="h-4 w-4 rounded-full border" />
          <span>{option.name}</span>
        </div>
      </div>
    </Command.Item>
  );
}

function RecentSearches({
  searches,
  onSelect,
  onClear,
  onRemove,
}: {
  searches: string[] | undefined;
  onSelect: (term: string) => void;
  onClear: () => void;
  onRemove: (term: string) => void;
}) {
  if (!searches || searches.length === 0) return null;

  return (
    <Command.Group
      heading={
        <div className="flex justify-between items-center">
          <span>Recent Searches</span>
          <button
            className="text-xs text-neutral-400 hover:text-neutral-600 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            Clear
          </button>
        </div>
      }
      className="text-xs px-2 text-neutral-400"
    >
      <Command.List className="text-neutral-900">
        {searches.map((term) => (
          <Command.Item
            key={term}
            className={cn(
              "hover:cursor-pointer py-2 px-1 hover:bg-accent rounded-md text-sm flex gap-3 items-center group",
              "data-[selected=true]:bg-accent"
            )}
            value={`recent-${term}`}
            onSelect={() => onSelect(term)}
          >
            <History className="w-4 h-4 text-neutral-500 flex-none" />
            <span className="flex-1">{term}</span>
            <button
              className="opacity-0 group-hover:opacity-100 group-data-[selected=true]:opacity-100 text-neutral-400 hover:text-neutral-600 cursor-pointer p-0.5"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(term);
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </Command.Item>
        ))}
      </Command.List>
    </Command.Group>
  );
}

function NavigationGroup({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  return (
    <Command.Group
      heading="Navigation"
      className="text-xs px-2 text-neutral-400"
    >
      <Command.List className="text-neutral-900">
        {navigationItems.map((item) => (
          <Command.Item
            key={item.path}
            className={cn(
              "hover:cursor-pointer px-1 py-2 hover:bg-accent rounded-md text-sm flex gap-3 items-center",
              "data-[selected=true]:bg-accent"
            )}
            value={item.label}
            onSelect={() => onNavigate(item.path)}
          >
            <item.icon className="w-4 h-4 text-neutral-500" />
            <span>{item.label}</span>
          </Command.Item>
        ))}
      </Command.List>
    </Command.Group>
  );
}

export function useSearchModal() {
  const [show, setShow] = useState(false);

  const searchModalCallback = useCallback(() => {
    return <SearchModal show={show} setShow={setShow} />;
  }, [show, setShow]);

  return useMemo(
    () => ({
      setShowSearchModal: setShow,
      SearchModal: searchModalCallback,
    }),
    [searchModalCallback, setShow]
  );
}

export default SearchModal;
