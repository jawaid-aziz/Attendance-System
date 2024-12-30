import { Header } from "../Components/Header";
import { SidebarProvider } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useRole } from "../Context/RoleProvider";
import { useId } from "../Context/IdProvider";

export const Layout = () => {
  const { role } = useRole();
  const { id } = useId();

  return (
    <SidebarProvider>
      <div className="flex">
        {/* Sidebar */}
        <AppSidebar role={role} id={id} />
      </div>

      <div className="flex flex-col w-full">
        {/* Header */}
        <div>
          <Header role={role} id={id} />
        </div>

        {/* Page Content */}
        <div className="">
          <Outlet /> {/* Nested routes */}
        </div>
      </div>
    </SidebarProvider>
  );
};
