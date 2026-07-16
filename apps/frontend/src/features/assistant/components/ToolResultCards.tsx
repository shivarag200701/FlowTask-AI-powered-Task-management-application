import { cn } from "@/lib/utils";
import { priorityStyles } from "@/utils/constants/priority";
import {
  Check,
  CheckCircle2,
  FolderOpen,
  Plus,
  CalendarClock,
  ArrowRight,
  Flag,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Shared types ────────────────────────────────────────────

interface TaskResult {
  id: string;
  title: string;
  completed?: boolean;
  priority?: "high" | "medium" | "low" | null;
  dueDate?: string | null;
  tags?: string[];
  project?: string | null;
  newDate?: string;
}

interface ProjectResult {
  id: string;
  name: string;
  slug: string | null;
}

// ─── ProjectListCard ─────────────────────────────────────────

export function ProjectListCard({ projects }: { projects: ProjectResult[] }) {
  if (!projects?.length) return null;

  const navigate = useNavigate();

  return (
    <div className="rounded-lg border border-border bg-card shadow-2xs overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <FolderOpen className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {projects.length} {projects.length === 1 ? "Project" : "Projects"}
        </span>
      </div>
      <div>
        {projects.map((project, i) => (
          <div
            key={project.id}
            className={cn(
              "px-3 py-2.5 flex items-center justify-between text-sm hover:bg-accent cursor-pointer transition-colors duration-150 group",
              i !== projects.length - 1 && "border-b border-border"
            )}
            onClick={() => navigate(`/app/projects/${project.slug}`)}
          >
            <div className="flex items-center gap-2.5">
              <div className="size-2 rounded-full bg-foreground/20" />
              <span className="text-sm font-medium text-foreground">
                {project.name}
              </span>
            </div>
            <ChevronRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TaskListCard ────────────────────────────────────────────

export function TaskListCard({ tasks }: { tasks: TaskResult[] }) {
  if (!tasks?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card shadow-2xs overflow-hidden">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground">
          {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
        </span>
      </div>
      <div>
        {tasks.map((task, i) => (
          <div
            key={task.id}
            className={cn(
              "px-3 py-2.5 flex items-center gap-3",
              i !== tasks.length - 1 && "border-b border-border"
            )}
          >
            {/* Checkbox — matches app's rounded circle style */}
            <div
              className={cn(
                "h-5 w-5 shrink-0 rounded-full border flex items-center justify-center",
                task.completed
                  ? "border-green-500 bg-green-500"
                  : "border-border/50 bg-linear-to-t from-neutral-100"
              )}
            >
              {task.completed && (
                <Check className="size-3 text-white" strokeWidth={2.5} />
              )}
            </div>

            {/* Title */}
            <span
              className={cn(
                "text-sm font-medium flex-1 min-w-0 truncate",
                task.completed && "line-through opacity-50"
              )}
            >
              {task.title}
            </span>

            {/* Priority pill */}
            {task.priority && (
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-md capitalize",
                  priorityStyles[task.priority]
                )}
              >
                {task.priority}
              </span>
            )}

            {/* Project label */}
            {task.project && (
              <span className="text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded-md">
                {task.project}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TaskActionCard ──────────────────────────────────────────

type TaskAction = "created" | "completed" | "rescheduled" | "updated";

const actionConfig: Record<
  TaskAction,
  { icon: typeof Plus; label: string; iconBg: string; iconColor: string }
> = {
  created: {
    icon: Plus,
    label: "Task created",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  completed: {
    icon: CheckCircle2,
    label: "Task completed",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  rescheduled: {
    icon: CalendarClock,
    label: "Task rescheduled",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  updated: {
    icon: Flag,
    label: "Priority updated",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
};

export function TaskActionCard({
  task,
  action,
}: {
  task: TaskResult;
  action: TaskAction;
}) {
  if (!task) return null;

  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border border-border bg-card shadow-2xs px-3 py-2.5 flex items-center gap-3">
      {/* Icon with colored background */}
      <div
        className={cn(
          "size-7 rounded-full flex items-center justify-center shrink-0",
          config.iconBg
        )}
      >
        <Icon className={cn("size-3.5", config.iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium">
          {config.label}
        </p>
        <p className="text-sm font-medium text-foreground truncate">
          {task.title}
        </p>
      </div>

      {action === "rescheduled" && task.newDate && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <ArrowRight className="size-3" />
          <span className="font-medium">{task.newDate}</span>
        </div>
      )}

      {action === "updated" && task.priority && (
        <span
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-md capitalize shrink-0",
            priorityStyles[task.priority]
          )}
        >
          {task.priority}
        </span>
      )}
    </div>
  );
}
