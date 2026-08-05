import Login from "./Pages/Login";
import { Landing } from "./Pages/Landing";
import { GetStarted } from "./Pages/GetStarted";
import { Setup } from "./Pages/Setup";
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
import Companies from "./Components/Superadmin/Companies";
import CompanyDetail from "./Components/Superadmin/CompanyDetail";
import InviteSuperAdmin from "./Components/Superadmin/InviteSuperAdmin";
import { isTokenValid } from "@/lib/isTokenValid";
import { getHomePath } from "@/lib/getHomePath";
import { Navigate } from "react-router-dom";

export const AllRoutes = [
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/start",
    element: isTokenValid() ? <Navigate to={getHomePath()} /> : <GetStarted />,
  },
  {
    path: "/login",
    element: isTokenValid() ? <Navigate to={getHomePath()} /> : <Login />,
  },
  {
    path: "/:slug/login",
    element: isTokenValid() ? <Navigate to={getHomePath()} /> : <Login />,
  },
  {
    path: "/setup/:token",
    element: isTokenValid() ? <Navigate to={getHomePath()} /> : <Setup />,
  },
  {
    path: "/:slug/setup/:token",
    element: isTokenValid() ? <Navigate to={getHomePath()} /> : <Setup />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute roles={["superadmin"]}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "companies",
        element: <Companies />,
      },
      {
        path: "company/:id",
        element: <CompanyDetail />,
      },
      {
        path: "invite",
        element: <InviteSuperAdmin />,
      },
    ],
  },
  {
    path: "/:slug",
    element: (
      <ProtectedRoute roles={["admin", "employee"]}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
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
    path: "/:slug",
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
    ],
  },
];
