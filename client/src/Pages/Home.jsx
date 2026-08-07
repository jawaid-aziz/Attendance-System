import { Suspense, lazy } from "react";
import { useRole } from "../Context/RoleProvider";
import { useId } from "../Context/IdProvider";

// Dashboards pull in recharts (~700 kB); lazy-load them so the landing page
// and the rest of the app stay lean, and charts only load for signed-in users.
const EmployeeDashboard = lazy(() =>
  import("../Components/Dashboard/EmployeeDashboard")
);
const AdminDashboard = lazy(() =>
  import("../Components/Dashboard/AdminDashboard")
);

const DashboardLoading = () => (
  <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
    <div className="h-20 w-72 animate-pulse rounded-2xl bg-slate-100" />
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
      <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  </div>
);

export const Home = () => {
  const { role } = useRole();
  const { id, loading: idLoading } = useId();

  if (idLoading) {
    return <DashboardLoading />;
  }

  if (!id) {
    return <div>Error: User ID not found. Please log in again.</div>;
  }

  const Dashboard = role === "admin" ? AdminDashboard : EmployeeDashboard;

  return (
    <Suspense fallback={<DashboardLoading />}>
      <Dashboard />
    </Suspense>
  );
};

// export default Home;
