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
import { LogOut, Menu, UserCircle, Building2 } from "lucide-react";
import { useCompany } from "../Context/CompanyProvider";
import { useUser } from "../hooks/useUser";
import PropTypes from "prop-types";

export const Header = ({ role, id }) => {
  const navigate = useNavigate();
  const slug = localStorage.getItem("slug") || "";
  const base = slug ? `/${slug}` : "";
  const { company } = useCompany();
  const user = useUser(id);
  const firstName = user?.firstName || "";

  const isSuperadmin = role === "superadmin";
  const roleLabel = isSuperadmin
    ? "Super Admin Panel"
    : role === "admin"
    ? "Admin Dashboard"
    : "User Dashboard";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    localStorage.removeItem("slug");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login");
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

      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800 tracking-wide flex items-center justify-center gap-2">
          {!isSuperadmin && company?.name && (
            <Building2 className="h-6 w-6 text-cornflower-blue-700" />
          )}
          {isSuperadmin || !company?.name ? roleLabel : company.name}
        </h1>
        {!isSuperadmin && company?.name && (
          <p className="text-sm text-gray-500">{roleLabel}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="hidden">
          <ModeToggle />
        </div>

        {firstName && (
          <span className="text-sm text-gray-600 hidden md:inline">
            Hi, {firstName}
          </span>
        )}

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <UserCircle className="h-8 w-8 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => navigate(`${base}/profile`)}
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

Header.propTypes = {
  role: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
