import { Link } from "react-router-dom";
import {
  Home,
  Settings,
  Users,
  ClipboardList,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react"; // Added LogOut icon
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

  // State to manage open menus
  const [openMenus, setOpenMenus] = useState({});

  // Menu items with grouped structure
  const menuItems = [
    {
      title: "Home",
      url: "/home",
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
      title: "Settings",
      icon: Settings,
      children: [
        { title: "Profile", url: `/profile/${id}` },
        ...(role === "admin"
          ? [
              { title: "Timezone", url: `/timezone` },
              { title: "Configuration", url: `/config` },
            ]
          : []),
      ],
    },
  ];

  const handleLogout = () => {
    console.log("Logging out...");
    window.location.href = "/"; // Redirect to login
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
        {/* Sidebar Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm text-l">
            OnTime Attendance
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {/* Top-level menu items */}
                  <div
                    onClick={() =>
                      item.children ? toggleMenu(item.title) : null
                    }
                    className={`flex items-center justify-between gap-2 cursor-pointer ${
                      item.children ? "" : "hover:bg-gray-100" // Add hover effect for clickable parent without children
                    }`}
                  >
                    <div className="flex items-center gap-1 py-1">
                      <item.icon className="text-sm" /> {/* Smaller icon */}
                      {item.url && !item.children ? ( // Use Link for parents without children
                        <Link to={item.url}>
                          <span>{item.title}</span>
                        </Link>
                      ) : (
                        <span>{item.title}</span> // For parents with children, just display the title
                      )}
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

                  {/* Render sub-items if children exist and menu is open */}
                  {item.children && openMenus[item.title] && (
                    <SidebarMenu className="ml-2">
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

        {/* Sidebar Footer */}
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
