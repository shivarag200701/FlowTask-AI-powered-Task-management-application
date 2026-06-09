import { useContext, useMemo } from "react";
import { CalendarDays, CircleCheckBig, Search, Tag, Inbox } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import TodayCalendarIcon from "../TodayCalendarIcon";
import { ModalContext } from "../modals/ModalProvider";
import { useOverDueTodos, useTodayTodos } from "@/hooks/use-todos";

const quickLinks = [
  { label: "Tags", icon: Tag, path: "/app/tags" },
  { label: "Inbox", icon: Inbox, path: "/app/inbox" },
  { label: "Today", path: "/app/today" },
  { label: "Upcoming", icon: CalendarDays, path: "/app/upcoming" },
  { label: "Completed", icon: CircleCheckBig, path: "/app/completed" },
] as const;

export function NavQuickLinks() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setShowSearchModal } = useContext(ModalContext);
  const { data: todoTodos } = useTodayTodos();
  const { data: overdueTodos } = useOverDueTodos();

  const todoTodosCount = useMemo(() => {
    if (!todoTodos?.length && !overdueTodos?.length) {
      return 0;
    }
    return todoTodos?.length! + overdueTodos?.length!;
  }, [todoTodos]);

  const counts: Record<string, number | undefined> = {
    Today: todoTodosCount,
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="hover:bg-neutral-200"
            onClick={() => setShowSearchModal(true)}
          >
            <Search strokeWidth={1.5} />
            <span>Search</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {quickLinks.map((link) => (
          <SidebarMenuItem key={link.label}>
            <SidebarMenuButton
              className="hover:bg-neutral-200"
              isActive={location.pathname.includes(link.path)}
              onClick={() => navigate(link.path)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  {link.label === "Today" ? (
                    <TodayCalendarIcon className="h-4 w-4" />
                  ) : (
                    link.icon && <link.icon strokeWidth={1.5} size={16} />
                  )}
                  <span className="ml-2">{link.label}</span>
                </div>
                <div className="font-light text-primary text-xs">
                  {counts[link.label]}
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
