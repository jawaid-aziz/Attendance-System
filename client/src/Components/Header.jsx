import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "../Components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, UserCircle } from "lucide-react";
import { useId } from "@/Context/IdProvider";

export const Header = ({ role }) => {
  const navigate = useNavigate();
  const { id } = useId();
  const handleLogout = () => {
    navigate("/"); // Redirect to the login page
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 ">
      {/* Left Side: Sidebar Trigger */}
      <div>
        <SidebarTrigger>
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SidebarTrigger>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-gray-800 tracking-wide">
          {role === "admin" ? "Admin Dashboard" : "User Dashboard"}
        </h1>
      </div>

      <div className="flex items-center space-x-2">
        <div className="hidden">
          <ModeToggle />
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <UserCircle className="h-8 w-8 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => navigate(`/profile/${id}`)}
              className="cursor-pointer"
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
