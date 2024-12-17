import {
  Home,
  Settings,
  Users,
  ClipboardList,
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
    ...(role === "admin" // Add these items only if the role is 'admin'
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
        ...(role === "admin" // Add System option only for admin
          ? [{ title: "System", url: `/system-settings` }]
          : []),
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>OnTime Attendance</SidebarGroupLabel>
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
                    <SidebarMenu>
                      {item.children.map((child) => (
                        <SidebarMenuItem key={child.title}>
                          <SidebarMenuButton asChild>
                            <a href={child.url} className="pl-8">
                              {child.title}
                            </a>
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
      </SidebarContent>
    </Sidebar>
  );
}
