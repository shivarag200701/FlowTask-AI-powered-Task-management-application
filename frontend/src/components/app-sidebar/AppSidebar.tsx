"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  CalendarDays,
  CircleCheckBig,
  Command,
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
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import TodayCalendarIcon from "../TodayCalendarIcon";

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
  const { setShowSearchModal } = React.useContext(ModalContext);
  useHotkeys("mod+k", () => {
    setShowSearchModal(true);
  });
  return (
    <Sidebar collapsible="offcanvas" {...props} className="p-2 bg-neutral-200">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
          <Button
            Initial="Search"
            icon={<Search strokeWidth={1.5} />}
            variant="ghost"
            className="flex justify-start"
            onClick={() => {
              setShowSearchModal(true);
            }}
          />
          <Button
            Initial="Tags"
            icon={<Tag strokeWidth={1.5} />}
            variant="ghost"
            className="flex justify-start"
            onClick={() => {
              navigate("app/tags");
            }}
          />
          <Button
            Initial="Today"
            variant="ghost"
            icon={<TodayCalendarIcon />}
            className="flex justify-start"
            onClick={() => {
              navigate("app/today");
            }}
          />
          <Button
            Initial="Upcoming"
            variant="ghost"
            icon={<CalendarDays />}
            className="flex justify-start"
            onClick={() => {
              navigate("app/upcoming");
            }}
          />
          <Button
            Initial="Completed"
            variant="ghost"
            icon={<CircleCheckBig strokeWidth={1.5} />}
            className="flex justify-start"
            onClick={() => {
              navigate("app/completed");
            }}
          />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
