import { Link } from "react-router-dom";
import {
    Home,
    Settings,
    Users,
    ClipboardList,
    LogOut,
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
  
  export function AppSidebar({ role }) {
    const { id } = useId();
  
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
        url: "#",
        children: [
          { title: "View Attendance", url: `/attendance-history/${id}` },
        ],
      },
      ...(role === "admin"
        ? [
            {
              title: "Employees",
              icon: Users,
              url: "#",
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
        url: "#",
        children: [
          { title: "Profile", url: `/profile/${id}` },
          ...(role === "admin"
            ? [{ title: "Timezone", url: `/timezone` }]
            : []),
            ...(role === "admin"
              ? [{ title: "Configuration", url: `/config` }]
              : []),
        ],
      },
    ];
  
    const handleLogout = () => {
      // Logic for logging out
      console.log("Logging out...");
      window.location.href = "/"; // Redirect to login
    };
  
    return (
      <Sidebar >
        <SidebarContent className="bg-cornflower-blue-400">
          {/* Sidebar Menu */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm text-l">OnTime Attendance</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {/* Top-level menu items */}
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url || "#"}
                        className="flex items-center gap-2"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
  
                    {/* Render sub-items if children exist */}
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
