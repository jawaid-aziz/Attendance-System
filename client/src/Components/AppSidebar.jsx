import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Settings,
  Users,
  ClipboardList,
  LogOut,
  ChevronDown,
  ChevronUp,
  FolderDot,
} from "lucide-react";
import { useId } from "../Context/IdProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState } from "react";

export function AppSidebar({ role }) {
  const { id } = useId();
  const navigate = useNavigate();

  const [openMenus, setOpenMenus] = useState({});

  const menuItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Attendance",
      icon: ClipboardList,
      children: [
        { title: "View Attendance", url: `/attendance-history/${id}` },
      ],
    },
    ...(role === "admin"
      ? [
          {
            title: "Employees",
            icon: Users,
            children: [
              { title: "Employees List", url: "/employees-data" },
              { title: "Add Employee", url: "/add-employee" },
            ],
          },
        ]
      : []),
    {
      title: "Projects",
      icon: FolderDot,
      children: [
        ...(role == "admin" ? [{ title: "Add", url: `/add-project` }] : []),
        { title: "View", url: `/projects` },
        { title: "Tasks", url: `/tasks` },
      ],
    },
    {
      title: "Settings",
      icon: Settings,
      children: [
        { title: "Profile", url: `/profile/${id}` },
        ...(role === "admin"
          ? [
              { title: "Timezone", url: `/timezone` },
              { title: "Configuration", url: `/config` },
              { title: "Office Timing", url: `/officeTime` },
            ]
          : []),
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    console.log("Token, role, and id removed from localStorage.");
    navigate("/login");
  };

  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <Sidebar>
      <SidebarContent className="bg-cornflower-blue-300">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm text-l">
            OnTime Attendance
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <div
                    className={`flex items-center justify-between p-1 gap-2 rounded-md ${
                      item.children ? "" : "hover:bg-gray-100"
                    }`}
                  >
                    {item.url && !item.children ? (
                      <Link
                        to={item.url}
                        className="flex items-center gap-2 w-full py-1"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-left">{item.title}</span>{" "}
                      </Link>
                    ) : (
                      <div
                        onClick={() =>
                          item.children ? toggleMenu(item.title) : null
                        }
                        className="flex items-center justify-between gap-2 w-full cursor-pointer py-1"
                      >
                        <div className="flex items-center gap-1">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                        {item.children && (
                          <span>
                            {openMenus[item.title] ? (
                              <ChevronUp />
                            ) : (
                              <ChevronDown />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {item.children && openMenus[item.title] && (
                    <SidebarMenu className="ml-1">
                      {item.children.map((child) => (
                        <SidebarMenuItem key={child.title}>
                          <SidebarMenuButton asChild>
                            <Link to={child.url}>
                              <span className="pl-4">{child.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-red-500 hover:text-red-600 cursor-pointer"
                >
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full"
                  >
                    <LogOut />
                    <span>Log Out</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
