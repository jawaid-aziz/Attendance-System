import Login from "./Pages/Login";
import AttendanceHistory from "./Components/AttendanceHistory";
import AddEmployee from "./Components/AddEmployee";
import EmployeesData from "./Components/EmployeesData";
import { Home } from "./Pages/Home";
import { DeleteEmployee } from "./Components/DeleteEmployee";
import { Profile } from "./Components/Profile";
import { Timezone } from "./Components/Timezone";
import { Layout } from "./Pages/Layout";
import { Configuration } from "./Components/Configuration";

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
        path: "delete/:id",
        element: <DeleteEmployee/>
      },
      {
        path: "timezone",
        element: <Timezone />,
      },
      {
        path: "config",
        element: <Configuration />,
      },
    ],
  },
];
