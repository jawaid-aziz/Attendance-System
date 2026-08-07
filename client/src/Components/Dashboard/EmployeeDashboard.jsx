import { useEffect, useState, useMemo } from "react";
import { useId } from "../../Context/IdProvider";
import { useUser } from "../../hooks/useUser";
import { useServerTime } from "../../hooks/useServerTime";
import { API_URL } from "@/lib/config";
import { formatMoney, dayFromTimeString } from "@/lib/format";
import {
  CalendarCheck,
  AlertTriangle,
  XCircle,
  Coins,
} from "lucide-react";
import Clocking from "../Clocking";
import { StatCard } from "./StatCard";
import { DashboardHeader } from "./DashboardHeader";
import { AttendanceHeatmap } from "./AttendanceHeatmap";
import { CheckInChart } from "./CheckInChart";
import { SalaryDonut } from "./SalaryDonut";

const greetingForHour = (hour) => {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const EmployeeDashboard = () => {
  const { id } = useId();
  const user = useUser(id);
  const slug = localStorage.getItem("slug") || "";
  const { now, timezone } = useServerTime(slug);

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({
    monthlySalary: 0,
    totalDeductions: 0,
    netSalary: 0,
  });
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);

  const nowDate = new Date();
  const year = nowDate.getFullYear();
  const month = nowDate.getMonth() + 1;

  useEffect(() => {
    let active = true;
    const fetchRecords = async () => {
      try {
        const res = await fetch(
          `${API_URL}/attend/records/${id}?year=${year}&month=${month}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch records");
        const data = await res.json();
        if (active) {
          setRecords(data.records || []);
          setSummary({
            monthlySalary: data.monthlySalary || 0,
            totalDeductions: data.totalDeductions || 0,
            netSalary: data.netSalary || 0,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchRecords();
    return () => {
      active = false;
    };
  }, [id, year, month]);

  // Office schedule loads once; today's entry is derived from the live clock.
  useEffect(() => {
    let active = true;
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/getOfficeTiming`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch schedule");
        const data = await res.json();
        if (active) setSchedule(data.schedule || {});
      } catch (error) {
        console.error(error);
      }
    };
    fetchSchedule();
    return () => {
      active = false;
    };
  }, []);

  const todayName = timezone
    ? now.toLocaleDateString("en-US", { timeZone: timezone, weekday: "long" })
    : now.toLocaleDateString("en-US", { weekday: "long" });
  const todaySchedule = useMemo(() => schedule[todayName] || null, [schedule, todayName]);

  const presentDays = records.filter((r) => r.checkIn).length;
  const lateDays = records.filter((r) =>
    String(r.checkInstatus || "").toLowerCase().includes("late")
  ).length;
  const absentDays = records.filter((r) => !r.checkIn).length;

  const todayNumber = timezone
    ? Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          day: "numeric",
        }).format(now)
      )
    : now.getDate();
  const todayRecord = records.find(
    (r) => r.checkIn && dayFromTimeString(r.checkIn) === todayNumber
  );

  const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  const hour = timezone
    ? Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          hour: "2-digit",
          hour12: false,
        }).format(now)
      )
    : now.getHours();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <DashboardHeader
        greeting={
          user
            ? `${greetingForHour(hour)}, ${user.firstName}`
            : "Welcome back"
        }
        sub="Your attendance at a glance"
        now={now}
        timezone={timezone}
        schedule={todaySchedule}
      />

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Loading your dashboard…
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={<CalendarCheck className="h-5 w-5" />}
              label="Days Present"
              value={presentDays}
              sub={monthLabel}
              tone="green"
            />
            <StatCard
              icon={<AlertTriangle className="h-5 w-5" />}
              label="Late Days"
              value={lateDays}
              sub={monthLabel}
              tone="amber"
            />
            <StatCard
              icon={<XCircle className="h-5 w-5" />}
              label="Absent Days"
              value={absentDays}
              sub={monthLabel}
              tone="red"
            />
            <StatCard
              icon={<Coins className="h-5 w-5" />}
              label="Deductions"
              value={formatMoney(summary.totalDeductions)}
              sub="Month to date"
              tone="slate"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Clocking todayRecord={todayRecord} />
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <SalaryDonut
                monthlySalary={summary.monthlySalary}
                totalDeductions={summary.totalDeductions}
                netSalary={summary.netSalary}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <CheckInChart
                records={records}
                officeStart={todaySchedule?.startTime}
              />
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <AttendanceHeatmap
                records={records}
                timezone={timezone}
                year={year}
                month={month}
                monthLabel={monthLabel}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeDashboard;
