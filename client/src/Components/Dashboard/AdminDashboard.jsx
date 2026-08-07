import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { useServerTime } from "../../hooks/useServerTime";
import { useId } from "../../Context/IdProvider";
import { API_URL } from "@/lib/config";
import { slugifyName } from "@/lib/slugifyName";
import { formatMoney } from "@/lib/format";
import {
  Users,
  UserCheck,
  UserCog,
  AlertTriangle,
  Timer,
  Coins,
  Search,
  RefreshCw,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { DashboardHeader } from "./DashboardHeader";
import { TrendChart } from "./TrendChart";
import { HourlyHistogram } from "./HourlyHistogram";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_META = {
  "in-office": { label: "In office", className: "bg-green-100 text-green-700" },
  late: { label: "Late", className: "bg-amber-100 text-amber-700" },
  "checked-out": { label: "Checked out", className: "bg-slate-100 text-slate-600" },
  "not-checked-in": {
    label: "Not checked in",
    className: "bg-red-50 text-red-600",
  },
  absent: { label: "Absent", className: "bg-red-100 text-red-700" },
};

export const AdminDashboard = () => {
  const { id } = useId();
  const user = useUser(id);
  const slug = localStorage.getItem("slug") || "";
  const base = slug ? `/${slug}` : "";
  const { now, timezone } = useServerTime(slug);

  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      setData(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const filtered = (data?.employees || []).filter((employee) => {
    const name = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const greeting = user ? `${user.firstName}` : "";
  const hour = timezone
    ? Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          hour: "2-digit",
          hour12: false,
        }).format(now)
      )
    : now.getHours();
  const partOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const today = data?.today || {};

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <DashboardHeader
          greeting={`Good ${partOfDay}${greeting ? `, ${greeting}` : ""}`}
          sub="Your team's attendance today"
          now={now}
          timezone={timezone}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
          className="shrink-0"
          title="Refresh"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      {!data ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Loading your dashboard…
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Employees"
              value={data.totalEmployees}
              tone="cornflower"
            />
            <StatCard
              icon={<UserCheck className="h-5 w-5" />}
              label="Present Today"
              value={today.present || 0}
              tone="green"
            />
            <StatCard
              icon={<UserCog className="h-5 w-5" />}
              label="In Office Now"
              value={today.inOffice || 0}
              tone="cornflower"
            />
            <StatCard
              icon={<AlertTriangle className="h-5 w-5" />}
              label="Late Today"
              value={today.late || 0}
              tone="amber"
            />
            <StatCard
              icon={<Timer className="h-5 w-5" />}
              label="Not Checked In"
              value={today.notCheckedIn || 0}
              tone="red"
            />
            <StatCard
              icon={<Coins className="h-5 w-5" />}
              label="MTD Deductions"
              value={formatMoney(data.monthToDateDeductions)}
              tone="slate"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <TrendChart trend={data.trend} />
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <HourlyHistogram hourly={data.hourly} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Team Status
                </h3>
                <p className="text-sm text-slate-500">
                  Who&apos;s in, out, or running late right now
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name…"
                  className="h-10 pl-9"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    <th className="pb-3 pr-4">Employee</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((employee) => {
                    const meta = STATUS_META[employee.status] || STATUS_META["not-checked-in"];
                    return (
                      <tr
                        key={employee.id}
                        className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="py-3 pr-4">
                          <Link
                            to={`${base}/profile/${slugifyName(
                              employee.firstName,
                              employee.lastName
                            ) || "user"}`}
                            state={{ userId: employee.id }}
                            className="font-medium text-slate-900 hover:text-cornflower-blue-600"
                          >
                            {employee.firstName} {employee.lastName}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 capitalize text-slate-500">
                          {employee.role}
                        </td>
                        <td className="py-3 text-right">
                          <Badge className={cn("font-medium", meta.className)}>
                            {meta.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {!filtered.length && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-8 text-center text-sm text-slate-400"
                      >
                        No employees match “{search}”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
