import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { logout } from "@/api/user";
import { Auth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/use-users";
import { LogOut } from "lucide-react";
import { Popover } from "../ui/popover";
import { useState } from "react";

export function NavUser() {
  const { setIsAuthenticated, email } = Auth();
  const navigate = useNavigate();

  const { data: userProfile } = useUserProfile();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    navigate("/");
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover
          openPopover={isSettingsOpen}
          setOpenPopover={setIsSettingsOpen}
          content={
            <div className="py-2 text-base sm:text-sm pb-4">
              <div className="px-2 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left ">
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-medium">
                      {userProfile?.name ?? ""}
                    </span>
                    <span className=" text-neutral-500">{email}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="flex items-start justify-start hover:bg-accent/60 px-3 text-base sm:text-sm"
                onClick={handleLogout}
              >
                <LogOut />
                Log out
              </Button>
            </div>
          }
        >
          <div className="data-[state=open]:bg-neutral-300 cursor-pointer hover:bg-neutral-200 data-[state=open]:text-sidebar-accent-foreground w-fit p-2 rounded-lg">
            <Avatar className="h-8 w-8 rounded-full">
              {userProfile?.image && (
                <AvatarImage
                  src={userProfile.image}
                  alt={userProfile?.name ?? "John Doe"}
                  referrerPolicy="no-referrer"
                />
              )}
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
          </div>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
