import PropTypes from "prop-types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  minutesToHHMM,
  timeStringToMinutes,
  dayFromTimeString,
} from "@/lib/format";

const formatClock = (minutes) => {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const period = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(mm).padStart(2, "0")} ${period}`;
};

// Daily check-in times for the selected month, with a reference line marking
// the official office start time so late patterns are obvious at a glance.
export const CheckInChart = ({ records, officeStart }) => {
  const data = records
    .map((record) => {
      const minutes = timeStringToMinutes(record.checkIn);
      if (minutes === null) return null;
      const day = dayFromTimeString(record.checkIn);
      return { day, time: minutes };
    })
    .filter((d) => d && d.day !== null);

  const officeStartMinutes = timeStringToMinutes(officeStart);

  if (!data.length) {
    return (
      <div className="flex h-full min-h-40 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
        No check-ins recorded yet this month.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Check-in Time</h3>
        <p className="text-sm text-slate-500">
          When you&apos;ve been clocking in vs. office start
          {officeStartMinutes !== null &&
            ` at ${formatClock(officeStartMinutes)}`}
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, bottom: 0, left: -8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="day"
              type="number"
              domain={[1, "dataMax"]}
              tickCount={6}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              type="number"
              domain={[0, 1440]}
              tickFormatter={minutesToHHMM}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [formatClock(value), "Check-in time"]}
              labelFormatter={(label) => `Day ${label}`}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 13,
              }}
            />
            {officeStartMinutes !== null && (
              <ReferenceLine
                y={officeStartMinutes}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{
                  value: "Office start",
                  position: "insideTopRight",
                  fill: "#b45309",
                  fontSize: 12,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="time"
              stroke="#257eeb"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#257eeb", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

CheckInChart.propTypes = {
  records: PropTypes.array,
  officeStart: PropTypes.string,
};
