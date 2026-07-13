import { useContext } from "react";
import {
  CalendarDays,
  CircleCheckBig,
  Search,
  Tag,
  Inbox,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import TodayCalendarIcon from "../TodayCalendarIcon";
import { ModalContext } from "../modals/ModalProvider";
import { AILogo } from "@/components/ui/ai-logo";
import { cn } from "@/lib/utils";
import { NavUser } from "./nav-user";

const navItems = [
  { label: "Search", icon: Search, action: "search" as const },
  { label: "Tags", icon: Tag, path: "/app/tags" },
  { label: "Inbox", icon: Inbox, path: "/app/inbox" },
  { label: "Today", path: "/app/today" },
  { label: "Upcoming", icon: CalendarDays, path: "/app/upcoming" },
  { label: "Completed", icon: CircleCheckBig, path: "/app/completed" },
  { label: "AI", path: "/app/assistant" },
] as const;

export function NavAssistantQuickLinks() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setShowSearchModal } = useContext(ModalContext);

  return (
    <div className="flex flex-col items-center h-full py-2 gap-0.5">
      {navItems.map((item) => {
        const isActive =
          "path" in item && location.pathname.startsWith(item.path);

        const handleClick = () => {
          if ("action" in item && item.action === "search") {
            setShowSearchModal(true);
          } else if ("path" in item) {
            navigate(item.path);
          }
        };

        return (
          <button
            key={item.label}
            onClick={handleClick}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 rounded-md w-9 py-1.5 transition-colors",
              isActive
                ? "bg-neutral-300 text-sidebar-foreground"
                : "text-sidebar-foreground/60 hover:bg-neutral-200 hover:text-sidebar-foreground"
            )}
          >
            {item.label === "Today" ? (
              <TodayCalendarIcon className="size-4" />
            ) : item.label === "AI" ? (
              <AILogo active={!!isActive} className="size-[18px]" />
            ) : (
              <item.icon strokeWidth={1.5} className="size-4" />
            )}
            <span className="text-[9px] leading-tight font-medium">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Spacer to push user avatar to bottom */}
      <div className="flex-1" />
      <NavUser />
    </div>
  );
}
