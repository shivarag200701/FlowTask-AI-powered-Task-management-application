"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  CalendarDays,
  ChevronRight,
  CircleCheckBig,
  Command,
  Users,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Search,
  Settings2,
  SquareTerminal,
  Tag,
} from "lucide-react";

import { NavUser } from "@/components/app-sidebar/nav-user";
import { TeamSwitcher } from "@/components/app-sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import TodayCalendarIcon from "../TodayCalendarIcon";
import { useUserProfile } from "@/hooks/use-users";

import { ModalContext } from "../modals/ModalProvider";
import { useHotkeys } from "react-hotkeys-hook";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setShowSearchModal } = React.useContext(ModalContext);
  const { data: userProfile } = useUserProfile();
  const isMyProjectsActive = location.pathname.includes("/app/projects");
  useHotkeys("mod+k", () => {
    setShowSearchModal(true);
  });
  return (
    <Sidebar collapsible="offcanvas" {...props} className="p-2 bg-neutral-200">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2 ">
          <Button
            Initial="Search"
            icon={<Search strokeWidth={1.5} />}
            variant="ghost"
            className="flex justify-start hover:bg-neutral-200"
            onClick={() => {
              setShowSearchModal(true);
            }}
          />
          <Button
            Initial="Tags"
            icon={<Tag strokeWidth={1.5} />}
            variant="ghost"
            className={`flex justify-start hover:bg-neutral-200 ${location.pathname.includes("/app/tags") ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => {
              navigate("app/tags");
            }}
          />
          <Button
            Initial="Today"
            variant="ghost"
            icon={<TodayCalendarIcon />}
            className={`flex justify-start hover:bg-neutral-200 ${location.pathname.includes("/app/today") ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => {
              navigate("app/today");
            }}
          />
          <Button
            Initial="Upcoming"
            variant="ghost"
            icon={<CalendarDays />}
            className={`flex justify-start hover:bg-neutral-200 ${location.pathname.includes("/app/upcoming") ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => {
              navigate("app/upcoming");
            }}
          />
          <Button
            Initial="Completed"
            variant="ghost"
            icon={<CircleCheckBig strokeWidth={1.5} />}
            className={`flex justify-start hover:bg-neutral-200 ${location.pathname.includes("/app/completed") ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => {
              navigate("app/completed");
            }}
          />

          {/* My Projects */}
          <div className="mt-6 pt-4 border-t border-neutral-300">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider px-2 mb-2">
              Projects
            </p>
            <button
              onClick={() => navigate("app/projects")}
              className={`flex items-center gap-3 w-full rounded-lg px-2 py-2.5 transition-all hover:bg-neutral-200 cursor-pointer ${
                isMyProjectsActive ? "bg-primary/10 text-primary" : ""
              }`}
            >
              <Avatar className="h-6 w-6 rounded-full ring-2 ring-neutral-300">
                {userProfile?.image && (
                  <AvatarImage
                    src={userProfile.image}
                    alt={userProfile?.name ?? "User"}
                    referrerPolicy="no-referrer"
                  />
                )}
                <AvatarFallback className="rounded-full text-xs">
                  {userProfile?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate">My Projects</span>
              <ChevronRight className="ml-auto h-4 w-4 text-neutral-400" />
            </button>
          </div>

          {/* Workspaces */}
          {/* Workspaces */}
          <div className="mt-4 pt-4 border-t border-neutral-300">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider px-2 mb-2">
              Workspaces
            </p>
            <button
              onClick={() => navigate("app/workspace")}
              className={`flex items-center gap-3 w-full rounded-lg px-2 py-2.5 transition-all hover:bg-neutral-200 cursor-pointer ${
                location.pathname.includes("/app/workspace")
                  ? "bg-primary/10 text-primary"
                  : ""
              }`}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-300">
                <Users className="size-3.5 text-neutral-500" />
              </div>
              <span className="text-sm font-medium truncate">Workspaces</span>
              <ChevronRight className="ml-auto h-4 w-4 text-neutral-400" />
            </button>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
