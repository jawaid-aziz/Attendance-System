import { Header } from "../Components/Header";
import { SidebarProvider, SidebarTrigger } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useRole } from "../Context/RoleProvider";
import { useId } from "../Context/IdProvider";

export const Layout = () => {
  const { role } = useRole();
  const { id } = useId();

  return (
    <SidebarProvider>
      <div className="flex h-screen">

        {/* Sidebar */}
        <AppSidebar role={role} id={id} />

        {/* Sidebar Trigger */}
        <div className="p-3">
          <SidebarTrigger /> {/* Sidebar trigger for toggling */}
        </div>
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header role={role} id={id} />

          {/* Page Content */}
          <div className="p-4 flex-1 overflow-auto">
            <Outlet /> {/* Nested routes */}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
