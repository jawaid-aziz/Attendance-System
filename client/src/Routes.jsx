import Login from "./Pages/Login";
import AttendanceHistory from "./Components/AttendanceHistory";
import { UserInterface } from "./Pages/UserInterface";
import { AdminInterface } from "./Pages/AdminInterface";
import AddEmployee from "./Components/AddEmployee";
import { EmployeesData } from "./Components/EmployeesData";
import { Profile } from "./Components/Profile";
import { SystemSettings } from "./Components/SystemSettings";
import { Layout } from "./Pages/Layout";

export const AllRoutes =
[
    {
        path: '/',
        element: <Login />,
    },
    {
        path: "/",
        element: <Layout />,
        children: 
        [
            {
                path: "user-interface/:id",
                element: <UserInterface />,
            },
            {
                path: "admin-interface/:id",
                element: <AdminInterface />,
            },
            {
                path: "attendance-history/:id",
                element: <AttendanceHistory />,
            },
            {
                path: "add-employee",
                element: <AddEmployee />,
            },
            {
                path: "employees-data",
                element: <EmployeesData />,
            },
            {
                path: "profile",
                element: <Profile />,
            },
            {
                path: "system-settings",
                element: <SystemSettings />,
            },
        ]
            
    },

]