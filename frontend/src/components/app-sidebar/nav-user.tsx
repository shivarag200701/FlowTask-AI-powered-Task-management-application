import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { logout } from "@/api/user";
import { Auth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/use-users";
import { LogOut } from "lucide-react";

export function NavUser() {
  const { setIsAuthenticated, email } = Auth();
  const navigate = useNavigate();

  const { data: userProfile } = useUserProfile();

  console.log(userProfile?.image);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    navigate("/");
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
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
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg bg-white"
            side="bottom"
            align="end"
            sideOffset={8}
            collisionPadding={{ left: 15 }}
          >
            <DropdownMenuLabel className="px-2 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {userProfile?.name ?? ""}
                  </span>
                  <span className=" text-neutral-500">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem>
              <Button
                variant="ghost"
                className="flex items-start justify-start hover:bg-accent/60 px-3"
                onClick={handleLogout}
              >
                <LogOut />
                Log out
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
