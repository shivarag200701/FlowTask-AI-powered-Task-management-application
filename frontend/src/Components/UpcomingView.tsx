import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  PencilLine,
  Trash2,
  CopyPlus,
  Flag,
  Tag,
  Repeat,
  Calendar,
  AlarmClock,
} from "lucide-react";
import type { Todo } from "../types";
import { Checkbox } from "./ui/checkbox";
import { formatUpcomingDateHeader } from "@shiva200701/todotypes";
import WarningModal from "./WarningModal";
import InlineTaskForm from "./InlineTaskForm";
import completedSound from "@/assets/completed.wav";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  useDroppable,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import CalendarView from "./CalendarView";
import { toast } from "sonner";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import api from "../utils/api";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import CustomDatePicker from "./CustomDatePicker";
import { CSS } from "@dnd-kit/utilities";
import { useQueryClient } from "@tanstack/react-query";
import sortTasksByDateAndOrder from "@/utils/sortTask";
import { useAppTheme } from "@/hooks/useTheme";
import { Tooltip, TooltipTrigger } from "./ui/tooltip";
import { TooltipContent } from "./ui/tooltip";
import { Kbd } from "./ui/kbd";
import { getBorderColorClass } from "@/lib/utils";
import { MonthAndYearPicker } from "./Dashboard/UpcomingView/Components/MonthAndYearPicker";
import { useUpcomingDateRange } from "@/hooks/use-upcoming-date-range";

interface UpcomingViewProps {
  todos: Todo[];
  onToggleComplete: (todoId: string | number) => void;
  onDelete: (todoId: string | number) => void;
  onEdit: (todo: Todo) => void;
  onUpdateTodo: (todo: Todo) => void;
  onAddTask: (preselectedDate?: string) => void;
  onViewDetails: (todo: Todo) => void;
  onTaskCreated?: (todo: Todo) => void;
  onDuplicateTask: (todo: Todo) => void;
  onTaskUpdated: (todo: Todo) => void;
  viewType?: string;
  onViewTypeChange?: (viewType: string) => void;
}

interface DraggableTaskProps {
  todo: Todo;
  index: number;
  columnIndex: number;
  onToggleComplete: (todoId: string | number) => void;
  onDelete: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onViewDetails: (todo: Todo) => void;
  openDropdownId: number | string | null;
  setOpenDropdownId: (id: number | string | null) => void;
  hoveredTodoId: number | string | null;
  setHoveredTodoId: (id: number | string | null) => void;
  dropdownRefs: React.RefObject<Map<number | string, HTMLDivElement>>;
  playSound: () => void;
  onDuplicateTask: (todo: Todo) => void;
  onTaskUpdated: (todo: Todo) => void;
  todos: Todo[];
}

interface DroppableDateColumnProps {
  date: Date;
  dayTasks: Todo[];
  isOverdue?: boolean;
  onAddTask: (date: Date) => void;
  onTaskCreated: (todo: Todo) => void;
  onTaskUpdated: (todo: Todo) => void;
  children: React.ReactNode;
  isFormOpen: boolean;
  onOpenForm: () => void;
  onCloseForm: () => void;
  todos: Todo[];
  columnIndex: number;
  activeTodo?: Todo | null;
}

const SortableTask = ({
  todo,
  index,
  columnIndex,
  onToggleComplete,
  onDelete,
  onViewDetails,
  openDropdownId,
  setOpenDropdownId,
  hoveredTodoId,
  setHoveredTodoId,
  dropdownRefs,
  playSound,
  onDuplicateTask,
  onTaskUpdated,
  todos,
}: DraggableTaskProps) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useSortable({
      id: todo.id || `temp-${index}`,
      data: {
        todo,
        columnIndex,
        type: "task",
      },
      animateLayoutChanges: () => false,
    });

  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const style = {
    transform: CSS.Transform.toString(transform),
    userSelect: "none" as const,
  };

  const priorityColors = {
    high: "text-red-500",
    medium: "text-blue-500",
    low: "text-green-500",
    none: "text-gray-500",
  };

  // Check if todo.completeAt is for today (comparing local dates)
  const isToday = (completeAt: string | null | undefined): boolean => {
    if (!completeAt) return false;
    const todoDate = new Date(completeAt);
    const now = new Date();

    return (
      todoDate.getFullYear() === now.getFullYear() &&
      todoDate.getMonth() === now.getMonth() &&
      todoDate.getDate() === now.getDate()
    );
  };

  const isTomorrow = (completeAt: string | null | undefined): boolean => {
    if (!completeAt) return false;
    const todoDate = new Date(completeAt);
    const now = new Date();
    return (
      todoDate.getFullYear() === now.getFullYear() &&
      todoDate.getMonth() === now.getMonth() &&
      todoDate.getDate() === now.getDate() + 1
    );
  };

  const isMobile = window.innerWidth < 768;

  const toggleDropdown = (
    todoId: number | string | undefined,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    if (!todoId) return;
    const willOpen = openDropdownId !== todoId;
    setOpenDropdownId(willOpen ? todoId : null);

    if (willOpen && buttonRef.current) {
      // Calculate position when opening
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        right: window.innerWidth - rect.right,
      });
    } else {
      setDropdownPosition(null);
    }
  };

  // Reset position when dropdown closes externally
  useEffect(() => {
    if (openDropdownId !== todo.id) {
      setDropdownPosition(null);
    }
  }, [openDropdownId, todo.id]);

  const handleDeleteClick = (todo: Todo) => {
    setOpenDropdownId(null);
    setDropdownPosition(null);
    onDelete(todo);
  };
  const [isEditing, setIsEditing] = useState(false);

  const handlePrioritySelect = (todo: Todo) => {
    // Optimistic update - update UI first
    onTaskUpdated(todo);
    setOpenDropdownId(null);
    setDropdownPosition(null);

    // Fire-and-forget API call
    api
      .put(`/v1/todo/${todo.id}`, {
        title: todo.title,
        description: todo.description,
        completeAt: todo.completeAt,
        category: todo.category,
        priority: todo.priority ?? null,
        isRecurring: todo.isRecurring,
        recurrencePattern: todo.recurrencePattern ?? null,
        recurrenceInterval: todo.recurrenceInterval ?? null,
        recurrenceEndDate: todo.recurrenceEndDate ?? null,
        isAllDay: todo.isAllDay,
      })
      .catch((error) => {
        console.error("Error updating priority", error);
      });
  };
  const getTimeFromDate12hr = (date: string): string => {
    if (!date) return "";
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {isEditing ? (
        <InlineTaskForm
          columnIndex={columnIndex}
          index={index}
          preselectedDate={
            todo.completeAt ? new Date(todo.completeAt) : new Date()
          }
          todo={todo}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
          onUpdate={(todo) => {
            onTaskUpdated(todo);
            setIsEditing(false);
          }}
          todos={todos}
        />
      ) : (
        <div
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
          className={`p-3 ${isDragging ? "bg-muted" : "bg-task"} 
          ${isDragging ? "h-[100px]" : ""} backdrop-blur-sm border border-border border-l-5 ${getBorderColorClass(todo.color)} rounded-xl relative cursor-pointer active:cursor-grabbing shadow-md hover:shadow-[0_0_6px_-1px_rgba(0,0,0,0.3)] dark:hover:none hover:border-border-hover mb-3 ${openDropdownId === todo.id ? "z-50" : ""}`}
          onMouseEnter={() => todo.id && setHoveredTodoId(todo.id)}
          onMouseLeave={() => setHoveredTodoId(null)}
          onClick={() => {
            onViewDetails(todo);
          }}
        >
          {!isDragging && (
            <>
              {/* Three-dot Menu */}
              <Tooltip>
                <TooltipTrigger asChild>
                  {todo.id && (
                    <div
                      className={`absolute top-2 right-2 z-20 transition-opacity duration-200 pointer-events-auto ${
                        openDropdownId === todo.id ||
                        hoveredTodoId === todo.id ||
                        isMobile
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                      ref={(el) => {
                        if (el && todo.id) {
                          dropdownRefs.current.set(todo.id, el);
                        }
                      }}
                      onMouseEnter={() => todo.id && setHoveredTodoId(todo.id)}
                      onMouseLeave={() => {
                        if (openDropdownId !== todo.id) {
                          setHoveredTodoId(null);
                        }
                      }}
                    >
                      <button
                        ref={buttonRef}
                        className={`text-muted-foreground ${openDropdownId === todo.id && "bg-secondary"} hover:text-foreground p-1 rounded-sm hover:bg-secondary transition-colors cursor-pointer`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(todo.id!, e);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        title="More options"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                  <div className="flex items-center gap-2 ">
                    More options<Kbd>.</Kbd>
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Dropdown Menu - Rendered via Portal */}
              {openDropdownId === todo.id &&
                dropdownPosition &&
                createPortal(
                  <div
                    className="fixed z-9999 w-45 bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.2)]"
                    data-dropdown-menu="true"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      right: `${dropdownPosition.right}px`,
                    }}
                  >
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-3 cursor-pointer border-b border-border"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsEditing(true);
                        setOpenDropdownId(null);
                        setDropdownPosition(null);
                      }}
                    >
                      <PencilLine className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <div className="text-foreground px-3 py-2 text-xs font-semibold">
                      Priority
                    </div>
                    <div className="px-3 py-1 flex items-center gap-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            todo.priority =
                              index === 0
                                ? "high"
                                : index === 1
                                  ? "medium"
                                  : index === 2
                                    ? "low"
                                    : null;
                            handlePrioritySelect(todo);
                          }}
                        >
                          <Flag
                            className={`w-7 h-7 hover:bg-gray-800 p-[5px] rounded-md cursor-pointer ${priorityColors[index === 0 ? "high" : index === 1 ? "medium" : index === 2 ? "low" : "none"]}`}
                            style={{
                              fill:
                                index === 0
                                  ? "#DC2828"
                                  : index === 1
                                    ? "#3B82F6"
                                    : index === 2
                                      ? "#28A745"
                                      : "none",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateTask(todo as Todo);
                        setOpenDropdownId(null);
                        setDropdownPosition(null);
                      }}
                    >
                      <CopyPlus className="w-4 h-4" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-red-400 transition-colors flex items-center gap-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(todo);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">Delete</span>
                    </button>
                  </div>,
                  document.body,
                )}
              <div className="flex gap-3 pr-4">
                <div className="pt-0.5">
                  <Checkbox
                    className={` rounded-full cursor-pointer h-4.5 w-4.5 border-2 ${todo.priority === "high" ? "border-red-500" : todo.priority === "medium" ? "border-blue-500" : todo.priority === "low" ? "border-green-500" : "border-gray-500"}`}
                    defaultChecked={todo.completed}
                    onClick={(e) => {
                      e.stopPropagation();
                      todo.id && onToggleComplete(todo.id);
                      playSound();
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-foreground text-sm font-medium mb-1 line-clamp-2">
                    {todo.title}
                  </div>
                  {todo.description && (
                    <div className="text-muted-foreground text-xs mt-1 line-clamp-2">
                      {todo.description}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {todo.category && (
                      <div className="mt-2 text-gray-500  w-fit  rounded-md text-xs flex gap-1">
                        <div className="flex justify-center items-center">
                          <Tag className="w-3 h-3" />
                        </div>
                        <div>{todo.category}</div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {!todo.isAllDay && (
                        <div
                          className={`mt-2 ${isToday(todo.completeAt) ? "text-[#f46d63]" : isTomorrow(todo.completeAt) ? "text-[#b77424]" : "text-[#9062d4]"}  w-fit  rounded-md text-xs flex gap-1`}
                        >
                          <div className="flex justify-center items-center">
                            <Calendar className="w-3 h-3" />
                          </div>
                          <div>
                            {getTimeFromDate12hr(todo.completeAt ?? "")}
                          </div>
                        </div>
                      )}
                      {todo.isRecurring && (
                        <div
                          className={`mt-2 ${isToday(todo.completeAt) ? "text-[#f46d63]" : isTomorrow(todo.completeAt) ? "text-[#b77424]" : "text-[#9062d4]"}  w-fit  rounded-md text-xs flex gap-1`}
                        >
                          <div className="flex justify-center items-center">
                            <Repeat className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                      {todo.reminder && (
                        <div className="mt-2 w-fit  rounded-md text-xs flex gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                          <div className="flex justify-center items-center">
                            <AlarmClock className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

const DroppableDateColumn = ({
  date,
  dayTasks,
  isOverdue = false,
  onTaskCreated,
  onTaskUpdated,
  children,
  isFormOpen,
  onOpenForm,
  onCloseForm,
  todos,
  columnIndex,
}: DroppableDateColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${date.toLocaleDateString("en-CA")}`,
    data: {
      date,
      type: "column",
      columnIndex,
    },
  });
  function roundToNearest15Minutes(date: Date) {
    const ms = 1000 * 60 * 15;

    const roundedDate = new Date(Math.ceil(date.getTime() / ms) * ms);
    return roundedDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });
  }

  const [showDatePicker, setShowDatePicker] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>(
    roundToNearest15Minutes(new Date()),
  );
  const [isAllDay, setIsAllDay] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<
    "daily" | "weekly" | "monthly" | "yearly" | null
  >(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [isTopScrolled, setIsTopScrolled] = useState(false);
  const [isBottomScrolled, setIsBottomScrolled] = useState(false);

  const handleAddTaskClick = () => {
    onOpenForm();
  };

  const handleCancel = () => {
    onCloseForm();
  };

  const handleTaskCreated = (todo: Todo) => {
    onTaskCreated(todo);
    onCloseForm();
  };

  const handleTaskUpdated = (todo: Todo) => {
    onTaskUpdated(todo);
    onCloseForm();
  };

  useEffect(() => {
    const handleScroll = () => {
      if (divRef.current) {
        if (divRef.current.scrollTop > 0) {
          setIsTopScrolled(true);
        } else {
          setIsTopScrolled(false);
        }
        if (
          divRef.current.scrollTop + divRef.current.clientHeight <
          divRef.current.scrollHeight
        ) {
          setIsBottomScrolled(true);
        } else {
          setIsBottomScrolled(false);
        }
      }
    };
    const currentDiv = divRef.current;
    if (currentDiv) {
      currentDiv.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (currentDiv) {
        currentDiv.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const taskIds = useMemo(() => {
    // dayTasks already includes the reorganized item if it's been moved to this column
    return dayTasks.map((task) => task.id || `temp-${task.title}`);
  }, [dayTasks]);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col relative px-2 transition-colors`}
    >
      {/* Date Header */}
      <div className="pb-2">
        <div
          className={`flex items-center ${isOverdue ? "justify-between" : "gap-4"} mb-1`}
        >
          <div className="text-foreground text-sm font-semibold">
            {isOverdue ? "Overdue" : formatUpcomingDateHeader(date)}
          </div>
          {!isOverdue && (
            <div className="text-foreground text-xs">{dayTasks.length}</div>
          )}
          <div className="flex items-center gap-2">
            {isOverdue && (
              <>
                <button
                  className="text-foreground cursor-pointer text-xs hover:text-foreground transition-colors"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  ref={buttonRef}
                >
                  Reschedule
                </button>
                <div className="text-muted-foreground text-xs">
                  {dayTasks.length}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {isTopScrolled && (
        <div className="h-px rounded-full bg-muted w-full"></div>
      )}

      {/* Tasks Container - Only tasks should scroll */}
      <div
        className={`space-y-3  max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar`}
        ref={divRef}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>

      {isBottomScrolled && (
        <div className="h-px rounded-full bg-muted w-full"></div>
      )}

      {/* Add Task Button and Inline Form - Outside scroll container, always visible */}
      {!isOverdue && (
        <>
          {!isFormOpen ? (
            !isOver && (
              <button
                onClick={handleAddTaskClick}
                className="group flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-inset p-3  rounded-md w-full  hover:border-border "
              >
                <div className="flex items-center justify-center p-px rounded-full group-hover:bg-accent transition-colors">
                  <Plus className="w-4 h-4 group-hover:text-background transition-colors" />
                </div>
                <span className="text-sm font-light">Add task</span>
              </button>
            )
          ) : (
            <div
              className={` ${dayTasks.length > 5 ? "absolute inset-x-0 bottom-0 flex" : ""} `}
            >
              <InlineTaskForm
                columnIndex={columnIndex}
                todos={todos}
                index={dayTasks.length}
                preselectedDate={date}
                onCancel={handleCancel}
                onSuccess={handleTaskCreated}
                onUpdate={handleTaskUpdated}
              />
            </div>
          )}
        </>
      )}
      {showDatePicker && (
        <CustomDatePicker
          columnIndex={-1}
          isAllDay={isAllDay}
          todos={[]}
          selectedDate={selectedDate}
          isRecurring={isRecurring}
          setIsRecurring={setIsRecurring}
          recurrencePattern={recurrencePattern}
          setRecurrencePattern={setRecurrencePattern}
          onDateSelect={(date: string) => setSelectedDate(date)}
          onClose={() => setShowDatePicker(false)}
          index={0}
          selectedTime={selectedTime}
          onTimeSelect={(time: string) => setSelectedTime(time)}
          setIsAllDay={setIsAllDay}
          buttonRef={buttonRef}
        />
      )}
    </div>
  );
};

const UpcomingView = ({
  todos,
  onToggleComplete,
  onDelete,
  onEdit,
  onUpdateTodo,
  onAddTask,
  onViewDetails,
  onTaskCreated,
  onDuplicateTask,
  onTaskUpdated,
  viewType: externalViewType,
}: UpcomingViewProps) => {
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(
    null,
  );
  const [hoveredTodoId, setHoveredTodoId] = useState<number | string | null>(
    null,
  );
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [originalCompleteAt, setOriginalCompleteAt] = useState<string | null>(
    null,
  );
  const [openFormDate, setOpenFormDate] = useState<string | null>(null);

  const { theme } = useAppTheme();

  // Use external viewType if provided, otherwise default to "board"
  const viewType = externalViewType ?? "board";
  const dropdownRefs = useRef<Map<number | string, HTMLDivElement>>(new Map());
  const audio = new Audio(completedSound);

  const queryClient = useQueryClient();

  // Get todos from cache (updates immediately) with fallback to prop
  // This ensures we see reordering changes instantly without waiting for prop updates
  // Read directly from cache on each render to get the latest data synchronously
  const todosFromCache = queryClient.getQueryData<Todo[]>(["todos"]) || todos;

  const getOverDueTasks = (): Todo[] => {
    //For all day todo
    const todayLocalStr = new Date().toLocaleDateString("en-CA");

    return todosFromCache.filter((todo) => {
      if (todo.completed || !todo.completeAt) return false;

      //untimed todos
      if (todo.isAllDay) {
        return todo.completeAt.split("T")[0] < todayLocalStr;
      }

      //timed todos
      return (
        new Date(todo.completeAt).toLocaleDateString("en-CA") < todayLocalStr
      );
    });
  };
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Calculate number of days based on screen size
  const getDayCount = () => {
    const smallTablet = windowWidth >= 768 && windowWidth <= 850;
    const isTablet = windowWidth <= 1024;

    let dayCount;
    if (smallTablet) {
      dayCount = 3;
    } else if (isTablet) {
      dayCount = 4;
    } else {
      dayCount = 5;
    }
    // Reduce by 1 if overdue tasks are present (to make room for overdue column)
    return getOverDueTasks().length > 0 ? dayCount - 1 : dayCount;
  };

  const dayCount = getDayCount();

  const {
    startDate,
    navigatePrevious,
    navigateNext,
    navigateToToday,
    dateRange,
    setIsMonthYearPickerOpen,
    isMonthYearPickerOpen,
    currentMonthYearLabel,
    selectMonthYear,
  } = useUpcomingDateRange(dayCount);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isToday = (completeAt: string | null | undefined): boolean => {
    if (!completeAt) return false;
    const todoDate = new Date(completeAt);
    const now = new Date();

    return (
      todoDate.getFullYear() === now.getFullYear() &&
      todoDate.getMonth() === now.getMonth() &&
      todoDate.getDate() === now.getDate()
    );
  };

  const isTomorrow = (completeAt: string | null | undefined): boolean => {
    if (!completeAt) return false;
    const todoDate = new Date(completeAt);
    const now = new Date();
    return (
      todoDate.getFullYear() === now.getFullYear() &&
      todoDate.getMonth() === now.getMonth() &&
      todoDate.getDate() === now.getDate() + 1
    );
  };

  const getTimeFromDate12hr = (date: string): string => {
    if (!date) return "";
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const playSound = () => {
    audio.play();
  };

  //smoother UI transitions
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 3 },
    }),

    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const getTasksForDate = (date: Date): Todo[] => {
    let todosForDate: Todo[] = [];
    const formatted = date.toLocaleDateString("en-CA");

    todosForDate = todosFromCache.filter((todo) => {
      if (todo.completed || !todo.completeAt) return false;

      //untimed todos
      if (todo.isAllDay) {
        return todo.completeAt.split("T")[0] === formatted;
      }

      //timed todos
      return (
        new Date(todo.completeAt).toLocaleDateString("en-CA") === formatted
      );
    });
    return todosForDate;
  };

  // Helper function to format date: day name if in current week, else "MMM d, yyyy"
  const formatDateForToast = (date: Date): string => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

    if (isWithinInterval(date, { start: weekStart, end: weekEnd })) {
      return format(date, "EEEE"); // Day name (Monday, Tuesday, etc.)
    } else {
      return format(date, "MMM d, yyyy"); // Month day, year
    }
  };
  const combineDateAndTime = (date: string, time: string) => {
    let dateObj;
    if (!date || !time) return "";
    const [year, month, day] = date.split("-").map(Number);
    dateObj = new Date(year, month - 1, day);

    const [hours, minutes] = time.split(":").map(Number);

    dateObj.setHours(hours, minutes, 0, 0);

    return dateObj.toISOString();
  };

  const handleAddTask = (date: Date) => {
    // Create date in local timezone at noon to avoid timezone rollover issues
    onAddTask(date.toISOString());
  };

  const handleDeleteClick = (todo: Todo) => {
    setTodoToDelete(todo);
    setIsWarningModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!todoToDelete?.id) {
      return;
    }
    onDelete(todoToDelete.id);
    setTodoToDelete(null);
    setIsWarningModalOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsWarningModalOpen(false);
    setTodoToDelete(null);
  };

  const handleEditClick = (todo: Todo) => {
    setOpenDropdownId(null);
    onEdit(todo);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const todo = active.data.current?.todo as Todo;
    setActiveTodo(todo);
    setOriginalCompleteAt(todo?.completeAt ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || !active.data.current) return;

    const isActiveATask = active.data.current?.type === "task";
    const isOverATask = over.data.current?.type === "task";
    const isOverAColumn = over.data.current?.type === "column";

    if (over.data.current?.columnIndex === -1) return;

    // Handle dropping a task over another task
    if (isActiveATask && isOverATask) {
      const activeTodo = active.data.current.todo as Todo;
      const overTodo = over.data.current?.todo as Todo;
      // If tasks are in different columns, update the active task's completeAt
      // to match the over task's column (for visual feedback)
      if (overTodo?.completeAt && activeTodo?.completeAt) {
        let activeDate: string;
        let overDate: string;

        if (activeTodo.isAllDay) {
          activeDate = activeTodo.completeAt.split("T")[0];
        } else {
          activeDate = new Date(activeTodo?.completeAt).toLocaleDateString(
            "en-CA",
          );
        }
        if (overTodo.isAllDay) {
          overDate = overTodo.completeAt.split("T")[0];
        } else {
          overDate = new Date(overTodo.completeAt).toLocaleDateString("en-CA");
        }

        if (activeDate !== overDate) {
          // Temporarily update the task's completeAt to show it in the new column
          let oldDateObj: Date | null;
          let time: string | null;
          let newDateTime: string | null;

          //timed todos
          if (!activeTodo.isAllDay) {
            oldDateObj = activeTodo.completeAt
              ? new Date(activeTodo.completeAt)
              : null;
            time = oldDateObj
              ? oldDateObj.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: false,
                })
              : null;
            newDateTime = time && combineDateAndTime(overDate, time);
          }
          //untimed todos
          else {
            newDateTime = overDate;
          }

          // Update cache for immediate visual feedback
          queryClient.setQueryData<Todo[]>(["todos"], (prev = []) =>
            prev.map((todo) =>
              todo.id === activeTodo.id
                ? { ...todo, completeAt: newDateTime }
                : todo,
            ),
          );
        }
      }
    }

    // Handle dropping a task over a column
    if (isActiveATask && isOverAColumn) {
      const activeTodo = active.data.current.todo as Todo;
      const columnDate = over.data.current?.date as Date;

      const overDate = columnDate.toLocaleDateString("en-CA");

      if (activeTodo?.completeAt) {
        let activeDate;

        if (activeTodo.isAllDay) {
          activeDate = activeTodo.completeAt.split("T")[0];
        } else {
          activeDate = new Date(activeTodo?.completeAt).toLocaleTimeString(
            "en-CA",
          );
        }

        if (activeDate !== overDate) {
          // Temporarily update the task's completeAt to show it in the new column
          let oldDateObj: Date | null;
          let time: string | null;
          let newDateTime: string | null;

          //timed todos
          if (!activeTodo.isAllDay) {
            oldDateObj = activeTodo.completeAt
              ? new Date(activeTodo.completeAt)
              : null;
            time = oldDateObj
              ? oldDateObj.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: false,
                })
              : null;
            newDateTime = time && combineDateAndTime(overDate, time);
          }
          //untimed todos
          else {
            newDateTime = overDate;
          }
          // Update cache for immediate visual feedback
          queryClient.setQueryData<Todo[]>(["todos"], (prev = []) =>
            prev.map((todo) =>
              todo.id === activeTodo.id
                ? { ...todo, completeAt: newDateTime }
                : todo,
            ),
          );
        }
      }
    }
  };

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTodo(null);
    if (!over || !active.data.current) return;

    if (over.data.current?.columnIndex === -1) return;

    const todo = active.data.current.todo as Todo;

    const overData = over.data.current;
    let overDate: string;
    let activeDate: string;

    if (todo?.completeAt) {
      if (todo.isAllDay) {
        activeDate = todo.completeAt.split("T")[0];
      } else {
        activeDate = new Date(todo?.completeAt).toLocaleDateString("en-CA");
      }
    } else {
      return;
    }

    // Over Column
    if (overData?.type === "column") {
      overDate = overData.date.toLocaleDateString("en-CA");
    }
    //over a Todo
    else if (overData?.type === "task") {
      const overTodo = overData?.todo as Todo;
      if (overTodo?.completeAt) {
        if (overTodo.isAllDay) {
          overDate = overTodo.completeAt.split("T")[0];
        } else {
          overDate = new Date(overTodo.completeAt).toLocaleDateString("en-CA");
        }
      } else {
        return;
      }
    } else {
      return;
    }

    let oldDateObj: Date | null;
    let time: string | null;
    let newDateTime: string | null;
    let newDate: Date;

    if (!todo.isAllDay) {
      oldDateObj = todo.completeAt ? new Date(todo.completeAt) : null;
      time = oldDateObj
        ? oldDateObj.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: false,
          })
        : null;
      newDateTime = time && combineDateAndTime(overDate, time);
      const [year, month, day] = overDate.split("-").map(Number);
      newDate = new Date(year, month - 1, day);
    } else {
      newDateTime = overDate;
      const [year, month, day] = overDate.split("-").map(Number);
      newDate = new Date(year, month - 1, day);
    }

    // Handle reordering for untimed tasks using arrayMove
    if (todo.isAllDay && activeDate === overDate) {
      // Reordering within the same date - use arrayMove
      // Use cache data for immediate updates
      let untimedTasksForDate = todosFromCache.filter(
        (t) =>
          t.isAllDay && t.completeAt && t.completeAt.split("T")[0] === overDate,
      );

      untimedTasksForDate = sortTasksByDateAndOrder(untimedTasksForDate);

      // Find indices
      const activeIndex = untimedTasksForDate.findIndex(
        (t) => t.id === todo.id,
      );

      const overIndex = untimedTasksForDate.findIndex(
        (t) => t.id === overData?.todo.id,
      );

      // Use arrayMove to reorder
      const reorderedTasks = arrayMove(
        untimedTasksForDate,
        activeIndex,
        overIndex,
      );

      // Create a map of updated todos with new orders
      const updatedTodosMap = new Map<number | string, Todo>();
      reorderedTasks.forEach((task, index) => {
        const newOrder = index * 100;
        if (task.order !== newOrder && task.id) {
          updatedTodosMap.set(task.id, {
            ...task,
            order: newOrder,
          });
        }
      });

      // Batch update all todos at once in cache
      if (updatedTodosMap.size > 0) {
        queryClient.setQueryData<Todo[]>(["todos"], (prev = []) =>
          prev.map((todo) => {
            const updated = todo.id ? updatedTodosMap.get(todo.id) : undefined;
            return updated || todo;
          }),
        );
        // Make parallel API calls for all todos whose order changed
        try {
          const updatePromises = Array.from(updatedTodosMap.entries()).map(
            ([todoId, updatedTodo]) => {
              const payload: any = {
                title: updatedTodo.title,
                description: updatedTodo.description,
                completeAt: updatedTodo.completeAt,
                category: updatedTodo.category,
                priority: updatedTodo.priority ?? null,
                isRecurring: updatedTodo.isRecurring || false,
                isAllDay: updatedTodo.isAllDay || false,
                order: updatedTodo.order,
              };

              // Only include recurrence fields if the todo is recurring
              if (updatedTodo.isRecurring) {
                payload.recurrencePattern = updatedTodo.recurrencePattern;
                payload.recurrenceInterval = updatedTodo.recurrenceInterval;
                if (updatedTodo.recurrenceEndDate) {
                  payload.recurrenceEndDate = updatedTodo.recurrenceEndDate;
                }
              }

              return api.put(`/v1/todo/${todoId}`, payload);
            },
          );

          await Promise.all(updatePromises);
        } catch (error) {
          console.error("Error updating todo orders", error);
          // Revert cache on error
          queryClient.invalidateQueries({ queryKey: ["todos"] });
        }
      }

      // return; // Exit early - we've handled reordering
    }

    // Handle date changes or new task placement
    let newOrder: number | undefined;

    if (todo.isAllDay) {
      // Get all untimed tasks for target date (excluding dragged task)
      // Use cache data for immediate updates
      const untimedTasksForDate = todosFromCache.filter(
        (t) =>
          t.isAllDay &&
          t.completeAt &&
          new Date(t.completeAt).toLocaleDateString("en-CA") === overDate &&
          t.id !== todo.id,
      );

      // Sort by current order
      untimedTasksForDate.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      // Determine insert position
      let insertIndex: number;

      if (overData?.todo) {
        const overTodo = overData.todo as Todo;

        if (overTodo.isAllDay) {
          insertIndex = untimedTasksForDate.findIndex(
            (t) => t.id === overTodo.id,
          );
          if (insertIndex === -1) {
            insertIndex = untimedTasksForDate.length;
          }
        } else {
          // Dropping on a timed task - place at end of untimed
          insertIndex = untimedTasksForDate.length;
        }
      } else {
        // Dropping on empty column - place at end
        insertIndex = untimedTasksForDate.length;
      }

      // Simple index-based ordering
      newOrder = insertIndex * 100;
    }

    const updatedTodo = {
      ...todo,
      completeAt: newDateTime,
      ...(newOrder !== undefined && { order: newOrder }),
    };

    onUpdateTodo(updatedTodo);
    toast(
      <div className="flex items-center justify-between gap-2 w-full">
        <span className="pl-2">
          Date updated to{" "}
          <span className="underline cursor-pointer">
            {formatDateForToast(newDate)}
          </span>
        </span>
        <div className="flex items-center">
          <div
            className="flex justify-center items-center hover:bg-accent/30 px-3 py-1 rounded-sm cursor-pointer transition-all duration-300 w-20"
            onClick={async () => {
              onUpdateTodo({
                ...todo,
                completeAt: originalCompleteAt,
                order: todo.order ?? null, // Restore original order
              });
              //call backend
              await api.put(`/v1/todo/${todo.id}`, {
                ...todo,
                completeAt: originalCompleteAt,
                order: todo.order ?? null, // Restore original order
              });
              setOriginalCompleteAt(null); // Clear after undo
            }}
          >
            Undo
          </div>
        </div>
      </div>,
      {
        position: "bottom-left",
        style: {
          background: "var(--toast)",
          color: "white",
          border: "1px solid var(--toast)",
          fontWeight: "light",
          ...(theme === "dark" && {
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }),
        },
        action: {
          label: "X",
          onClick: () => {},
        },
        actionButtonStyle: {
          background: "transparent",
          color: "white",
          fontWeight: "100",
          borderRadius: "4px",
          padding: "4px 12px",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
          minHeight: "28px",
        },
      },
    );

    //call backend
    if (todo.id) {
      try {
        const payload: any = {
          title: todo.title,
          description: todo.description,
          completeAt: newDateTime,
          category: todo.category,
          priority: todo.priority ?? null,
          isRecurring: todo.isRecurring || false,
          isAllDay: todo.isAllDay || false,
        };

        // Include order if calculated
        if (newOrder !== undefined) {
          payload.order = newOrder;
        }

        // Only include recurrence fields if the todo is recurring
        if (todo.isRecurring) {
          payload.recurrencePattern = todo.recurrencePattern;
          payload.recurrenceInterval = todo.recurrenceInterval;
          if (todo.recurrenceEndDate) {
            payload.recurrenceEndDate = todo.recurrenceEndDate;
          }
        }
        await api.put(`/v1/todo/${todo.id}`, payload);
      } catch (error) {
        console.error("Error updating todo", error);
        onUpdateTodo(todo);
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-4 border-b-[0.5px]  border-secondary pb-4 px-5 md:px-6 pt-10 w-full">
        <>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col  gap-2 w-full">
              <h1 className="text-foreground text-2xl md:text-3xl font-bold ">
                Upcoming
              </h1>
              <div className="">
                {viewType === "board" && (
                  <MonthAndYearPicker
                    setIsMonthYearPickerOpen={setIsMonthYearPickerOpen}
                    startDate={startDate}
                    selectMonthYear={selectMonthYear}
                    isMonthYearPickerOpen={isMonthYearPickerOpen}
                    currentMonthYearLabel={currentMonthYearLabel}
                  />
                )}
              </div>
            </div>
          </div>
        </>
        <div className="">
          {viewType === "board" && (
            <div className="flex  border border-border rounded-sm ">
              <button
                onClick={navigatePrevious}
                className="text-muted-foreground hover:text-foreground transition-colors p-1  hover:bg-muted cursor-pointer"
              >
                <ChevronLeft className="w-4  h-4" />
              </button>
              <div className="w-px h-full bg-muted" />
              <button
                onClick={navigateToToday}
                className="text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-4 py-1  hover:bg-muted text-x font-sm cursor-pointer"
              >
                Today
              </button>
              <div className="w-px h-full bg-muted" />

              <button
                onClick={navigateNext}
                className="text-muted-foreground hover:text-foreground transition-colors p-1  hover:bg-muted cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Conditional Rendering: Board View or Calendar View */}
      {viewType === "board" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          {/* Calendar Columns */}
          <div className="flex gap-2 overflow-x-auto overflow-y-hidden custom-scrollbar whitespace-nowrap flex-1 pb-4 px-15">
            {/* Overdue Section */}
            {(() => {
              const overDueTasks = getOverDueTasks();

              if (overDueTasks.length > 0) {
                const overdueDate = new Date();
                overdueDate.setDate(overdueDate.getDate() - 1); // Use yesterday's date as placeholder
                const overdueDateKey = "overdue";
                const isFormOpen = openFormDate === overdueDateKey;
                return (
                  <div className="shrink-0 w-70">
                    <DroppableDateColumn
                      columnIndex={-1}
                      key={overdueDateKey}
                      date={overdueDate}
                      dayTasks={overDueTasks}
                      isOverdue={true}
                      onAddTask={handleAddTask}
                      isFormOpen={isFormOpen}
                      onOpenForm={() => setOpenFormDate(overdueDateKey)}
                      onCloseForm={() => setOpenFormDate(null)}
                      onTaskCreated={(todo) => {
                        if (onTaskCreated) {
                          onTaskCreated(todo);
                        }
                      }}
                      onTaskUpdated={(todo) => {
                        if (onTaskUpdated) {
                          onTaskUpdated(todo);
                        }
                      }}
                      todos={todos}
                      activeTodo={activeTodo}
                    >
                      {overDueTasks.map((todo, taskIndex) => (
                        <SortableTask
                          key={todo.id || `temp-overdue-${todo.title}`}
                          todo={todo}
                          columnIndex={-1}
                          index={taskIndex}
                          onToggleComplete={onToggleComplete}
                          onDelete={handleDeleteClick}
                          onEdit={handleEditClick}
                          onViewDetails={onViewDetails}
                          openDropdownId={openDropdownId}
                          setOpenDropdownId={setOpenDropdownId}
                          hoveredTodoId={hoveredTodoId}
                          setHoveredTodoId={setHoveredTodoId}
                          dropdownRefs={dropdownRefs}
                          playSound={playSound}
                          onDuplicateTask={onDuplicateTask}
                          onTaskUpdated={(todo) => {
                            if (onTaskUpdated) {
                              onTaskUpdated(todo);
                            }
                          }}
                          todos={todos}
                        />
                      ))}
                    </DroppableDateColumn>
                  </div>
                );
              }
              return null;
            })()}

            {/* Regular Date Columns */}
            {dateRange.map((date, index) => {
              const dayTasks = getTasksForDate(date);
              const sortedDayTasks = sortTasksByDateAndOrder(dayTasks);

              const dateKey = date.toISOString();
              const isFormOpen = openFormDate === dateKey;
              return (
                <div className="shrink-0 w-70 ">
                  <DroppableDateColumn
                    columnIndex={index}
                    key={dateKey}
                    date={date}
                    dayTasks={sortedDayTasks}
                    onAddTask={handleAddTask}
                    isFormOpen={isFormOpen}
                    onOpenForm={() => setOpenFormDate(dateKey)}
                    onCloseForm={() => setOpenFormDate(null)}
                    onTaskCreated={(todo) => {
                      if (onTaskCreated) {
                        onTaskCreated(todo);
                      }
                    }}
                    onTaskUpdated={(todo) => {
                      if (onTaskUpdated) {
                        onTaskUpdated(todo);
                      }
                    }}
                    todos={todos}
                    activeTodo={activeTodo}
                  >
                    {sortedDayTasks.map((todo, taskIndex) => (
                      <SortableTask
                        key={todo.id || `temp-${index}-${todo.title}`}
                        todo={todo}
                        columnIndex={index}
                        index={taskIndex}
                        onToggleComplete={onToggleComplete}
                        onDelete={handleDeleteClick}
                        onEdit={handleEditClick}
                        onViewDetails={onViewDetails}
                        openDropdownId={openDropdownId}
                        setOpenDropdownId={setOpenDropdownId}
                        hoveredTodoId={hoveredTodoId}
                        setHoveredTodoId={setHoveredTodoId}
                        dropdownRefs={dropdownRefs}
                        playSound={playSound}
                        onDuplicateTask={onDuplicateTask}
                        onTaskUpdated={(todo) => {
                          if (onTaskUpdated) {
                            onTaskUpdated(todo);
                          }
                        }}
                        todos={todos}
                      />
                    ))}
                  </DroppableDateColumn>
                </div>
              );
            })}
          </div>

          {/* Drag Overlay for better UX */}
          <DragOverlay
            dropAnimation={{
              duration: 0,
              easing: "ease",
            }}
          >
            {activeTodo ? (
              <div className="p-3  bg-drag-task  rounded-xl rotate-3 dark:shadow-[0_8px_6px_-1px_rgba(0,0,0,0.3)] border border-border dark:border-0">
                <div className="flex gap-3 pr-4">
                  <div className="pt-0.5">
                    <Checkbox
                      className={`border-blue-600 cursor-pointer ${activeTodo.priority === "high" ? "border-red-500" : activeTodo.priority === "medium" ? "border-blue-500" : activeTodo.priority === "low" ? "border-green-500" : "border-gray-500"}`}
                      defaultChecked={activeTodo.completed}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground text-sm font-medium mb-1 line-clamp-2">
                      {activeTodo.title}
                    </div>
                    {activeTodo.description && (
                      <div className="text-muted-foreground text-xs mt-1 line-clamp-2">
                        {activeTodo.description}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {activeTodo.category && (
                        <div className="mt-2 text-gray-500  w-fit  rounded-md text-xs flex gap-1">
                          <div className="flex justify-center items-center">
                            <Tag className="w-3 h-3" />
                          </div>
                          <div>{activeTodo.category}</div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {!activeTodo.isAllDay && (
                          <div
                            className={`mt-2 ${isToday(activeTodo.completeAt) ? "text-[#f46d63]" : isTomorrow(activeTodo.completeAt) ? "text-[#b77424]" : "text-[#9062d4]"}  w-fit  rounded-md text-xs flex gap-1`}
                          >
                            <div className="flex justify-center items-center">
                              <Calendar className="w-3 h-3" />
                            </div>
                            <div>
                              {getTimeFromDate12hr(activeTodo.completeAt ?? "")}
                            </div>
                          </div>
                        )}
                        {activeTodo.isRecurring && (
                          <div
                            className={`mt-2 ${isToday(activeTodo.completeAt) ? "text-[#f46d63]" : isTomorrow(activeTodo.completeAt) ? "text-[#b77424]" : "text-[#9062d4]"}  w-fit  rounded-md text-xs flex gap-1`}
                          >
                            <div className="flex justify-center items-center">
                              <Repeat className="w-3 h-3" />
                            </div>
                          </div>
                        )}
                        {!activeTodo.isAllDay && (
                          <div className="mt-2 w-fit  rounded-md text-xs flex gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                            <div className="flex justify-center items-center">
                              <AlarmClock className="w-3 h-3" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          <CalendarView
            todos={todos}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onEdit={onEdit}
            onUpdateTodo={onUpdateTodo}
            onAddTask={onAddTask}
            onViewDetails={onViewDetails}
            onTaskCreated={onTaskCreated}
            onDuplicateTask={onDuplicateTask}
            onTaskUpdated={onTaskUpdated}
          />
        </div>
      )}

      <WarningModal
        isOpen={isWarningModalOpen}
        onClose={handleDeleteCancel}
        onDelete={handleDeleteConfirm}
        title="Delete Task"
        description="Are you sure you want to delete this task?"
        buttonText="Delete"
      />
    </div>
  );
};

export default UpcomingView;
