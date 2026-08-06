import Login from "./Pages/Login";
import { Landing } from "./Pages/Landing";
import { GetStarted } from "./Pages/GetStarted";
import { Setup } from "./Pages/Setup";
import AttendanceHistory from "./Components/AttendanceHistory";
import AddEmployee from "./Components/AddEmployee";
import EmployeesData from "./Components/EmployeesData";
import { Home } from "./Pages/Home";
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

// Evaluated at render time (not module load) so the login/setup guards track
// the current auth state instead of being frozen at app start.
const PublicOnly = ({ children }) => {
  return isTokenValid() ? <Navigate to={getHomePath()} replace /> : children;
};

export const AllRoutes = [
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/start",
    element: (
      <PublicOnly>
        <GetStarted />
      </PublicOnly>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicOnly>
        <Login />
      </PublicOnly>
    ),
  },
  {
    path: "/:slug/login",
    element: (
      <PublicOnly>
        <Login />
      </PublicOnly>
    ),
  },
  {
    path: "/setup/:token",
    element: (
      <PublicOnly>
        <Setup />
      </PublicOnly>
    ),
  },
  {
    path: "/setup",
    element: (
      <PublicOnly>
        <Setup />
      </PublicOnly>
    ),
  },
  {
    path: "/:slug/setup/:token",
    element: (
      <PublicOnly>
        <Setup />
      </PublicOnly>
    ),
  },
  {
    path: "/:slug/setup",
    element: (
      <PublicOnly>
        <Setup />
      </PublicOnly>
    ),
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
        path: "company/:slug",
        element: <CompanyDetail />,
      },
      {
        path: "invite",
        element: <InviteSuperAdmin />,
      },
      {
        path: "profile/:name?",
        element: <Profile />,
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
        path: "attendance-history/:name?",
        element: <AttendanceHistory />,
      },
      {
        path: "profile/:name?",
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
