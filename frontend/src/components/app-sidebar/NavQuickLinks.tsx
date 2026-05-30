import { useContext } from "react";
import {
  CalendarDays,
  CircleCheckBig,
  Search,
  Tag,
} from "lucide-react";
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

const quickLinks = [
  { label: "Tags", icon: Tag, path: "/app/tags" },
  { label: "Today", path: "/app/today" },
  { label: "Upcoming", icon: CalendarDays, path: "/app/upcoming" },
  { label: "Completed", icon: CircleCheckBig, path: "/app/completed" },
] as const;

export function NavQuickLinks() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setShowSearchModal } = useContext(ModalContext);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton className="hover:bg-neutral-200" onClick={() => setShowSearchModal(true)}>
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
              {link.label === "Today" ? (
                <TodayCalendarIcon />
              ) : (
                link.icon && <link.icon strokeWidth={1.5} />
              )}
              <span>{link.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
