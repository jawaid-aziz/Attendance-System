import { Header } from "../Components/Header"
import { Sidebar } from "../Components/Sidebar"
import { Outlet } from "react-router-dom"
import { useRole } from "../Context/RoleProvider"
import { useId } from "../Context/IdProvider"

export const Layout = ({ children }) => {

  const { role } = useRole();
  const { id } = useId();

  if (!id || !role) {
    return <div>Loading...</div>;
  }

    return(
    <div className="flex">
      {/* Sidebar */}
      <Sidebar role={role} id={id} />

      {/* Main Content */}
      <div className="flex-1">
        <Header role={role} id={id} />
        <div className="p-4">
          <Outlet /> {/* Placeholder for nested routes */}
        </div>
      </div>
    </div>
)
}