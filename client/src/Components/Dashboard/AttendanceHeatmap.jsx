import PropTypes from "prop-types";
import { cn } from "@/lib/utils";
import { dayFromTimeString } from "@/lib/format";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const statusCell = (status) => {
  switch (status) {
    case "present":
      return "bg-green-500";
    case "late":
      return "bg-amber-400";
    case "absent":
      return "bg-red-500";
    case "missing":
      return "bg-slate-200";
    default:
      return "bg-slate-50 border border-slate-100";
  }
};

const tzOptions = (timezone) =>
  timezone ? { timeZone: timezone } : {};

// Resolve the day-of-month for a record in the company timezone. Prefers the
// server wall-clock string, falling back to the stored day Date.
const dayNumberFor = (record, timezone) => {
  const fromString = dayFromTimeString(record.checkIn);
  if (fromString !== null) return fromString;
  if (!record.day) return null;
  const parsed = new Intl.DateTimeFormat("en-US", {
    ...tzOptions(timezone),
    day: "numeric",
  }).format(new Date(record.day));
  return Number(parsed);
};

const statusFor = (record) => {
  if (!record) return null;
  if (!record.checkIn) return "absent";
  if (String(record.checkInstatus).toLowerCase().includes("late")) return "late";
  return "present";
};

// Month-view attendance heatmap: one cell per day, colored by status.
export const AttendanceHeatmap = ({ records, timezone, year, month, monthLabel }) => {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const today = new Intl.DateTimeFormat("en-US", {
    ...tzOptions(timezone),
    day: "numeric",
  }).format(new Date());
  const todayNumber = Number(today);

  const recordByDay = new Map();
  records.forEach((record) => {
    const day = dayNumberFor(record, timezone);
    if (day !== null && !recordByDay.has(day)) recordByDay.set(day, record);
  });

  const cells = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const record = recordByDay.get(day);
    const status = statusFor(record);
    const resolved =
      status ||
      (day <= todayNumber ? "missing" : "future");
    cells.push({ day, resolved, isToday: day === todayNumber });
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          This Month&apos;s Attendance
        </h3>
        <p className="text-sm text-slate-500">{monthLabel}</p>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="pb-1 text-center text-[11px] font-semibold text-slate-400"
          >
            {label}
          </div>
        ))}
        {cells.map(({ day, resolved, isToday }) => (
          <div
            key={day}
            title={`${monthLabel} ${day}`}
            className={cn(
              "flex aspect-square items-center justify-center rounded-lg text-[11px] font-semibold",
              statusCell(resolved),
              isToday && "ring-2 ring-cornflower-blue-600 ring-offset-1"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-green-500" /> Present
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-400" /> Late
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-red-500" /> Absent
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-slate-200" /> No entry
        </span>
      </div>
    </div>
  );
};

AttendanceHeatmap.propTypes = {
  records: PropTypes.array,
  timezone: PropTypes.string,
  year: PropTypes.number.isRequired,
  month: PropTypes.number.isRequired,
  monthLabel: PropTypes.string.isRequired,
};
