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
import ProtectedRoute from "./Components/ProtectedRoutes";
import OfficeTimings from "./Components/OfficeTimings";
import { AddProject } from "./Components/AddProject";
import { ViewProjects } from "./Components/ViewProjects";
import { Project } from "./Components/Project";
import { AddTask } from "./Components/AddTask";
import { Tasks } from "./Components/Tasks";
import { isTokenValid } from "@/lib/isTokenValid";
import { Navigate } from "react-router-dom";

export const AllRoutes = [
  {
    path: "/login",
    element: isTokenValid() ? <Navigate to="/" /> : <Login />, // Redirect if token is valid
  },
  {
    path: "/",
    element: (
      <ProtectedRoute roles={["admin", "employee"]}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "attendance-history/:id",
        element: <AttendanceHistory />,
      },
      {
        path: "profile/:id",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "add-employee",
        element: <AddEmployee />,
      },
      {
        path: "employees-data",
        element: <EmployeesData />,
      },
      {
        path: "delete/:id",
        element: <DeleteEmployee />,
      },
      {
        path: "timezone",
        element: <Timezone />,
      },
      {
        path: "config",
        element: <Configuration />,
      },
      {
        path: "officeTime",
        element: <OfficeTimings />,
      },
      {
        path: "add-project",
        element: <AddProject />,
      },
      {
        path: "projects",
        element: <ViewProjects />,
      },
      {
        path: "project/:id",
        element: <Project />,
      },
      {
        path: "add-task",
        element: <AddTask/>,
      },
      {
        path: "tasks",
        element: <Tasks />,
      },
    ],
  },
];
