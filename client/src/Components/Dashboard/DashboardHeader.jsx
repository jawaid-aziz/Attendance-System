import PropTypes from "prop-types";
import { Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const timeOptions = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
};

const dateOptions = {
  weekday: "long",
  month: "long",
  day: "numeric",
};

// Company-context greeting strip: who's signed in, the live company-timezone
// clock and today's office hours.
export const DashboardHeader = ({ greeting, sub, now, schedule }) => {
  const isOpen = !!schedule && schedule.isOpen === true;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {greeting}
        </h1>
        {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cornflower-blue-50 text-cornflower-blue-600">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <p className="font-mono text-xl font-bold text-slate-900">
            {now.toLocaleTimeString(undefined, timeOptions)}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarDays className="h-3.5 w-3.5" />
            {now.toLocaleDateString(undefined, dateOptions)}
          </p>
        </div>
        <div className="ml-2 flex flex-col items-end gap-1">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
              isOpen
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            )}
          >
            {isOpen ? "Open" : "Closed"}
          </span>
          {isOpen && (
            <span className="text-xs font-medium text-slate-500">
              {schedule.startTime} – {schedule.endTime}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

DashboardHeader.propTypes = {
  greeting: PropTypes.string.isRequired,
  sub: PropTypes.string,
  now: PropTypes.instanceOf(Date).isRequired,
  schedule: PropTypes.shape({
    isOpen: PropTypes.bool,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
  }),
};
