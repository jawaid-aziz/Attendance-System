import Login from "./Pages/Login";
import AttendanceHistory from "./Components/AttendanceHistory";
import AddEmployee from "./Components/AddEmployee";
import EmployeesData from "./Components/EmployeesData";
import { Home } from "./Pages/Home";

import { Profile } from "./Components/Profile";
import { SystemSettings } from "./Components/SystemSettings";
import { Layout } from "./Pages/Layout";

export const AllRoutes = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "home",
        element: <Home />,
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
        path: "profile/:id",
        element: <Profile />,
      },
      {
        path: "system-settings",
        element: <SystemSettings />,
      },
    ],
  },
];
