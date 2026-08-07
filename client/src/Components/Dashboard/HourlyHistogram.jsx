import PropTypes from "prop-types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const hourLabel = (hour) => {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${hour >= 12 ? "PM" : "AM"}`;
};

// How many employees checked in during each office hour today.
export const HourlyHistogram = ({ hourly }) => {
  const data = (hourly || []).map((entry) => ({
    ...entry,
    label: hourLabel(entry.hour),
  }));

  if (!data.length) {
    return (
      <div className="flex h-full min-h-40 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
        No check-ins recorded today.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Today&apos;s Check-ins by Hour
        </h3>
        <p className="text-sm text-slate-500">When your team clocked in today</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              formatter={(value) => [value, "Check-ins"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 13,
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={42}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.hour >= 9 && entry.hour <= 10 ? "#f59e0b" : "#257eeb"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

HourlyHistogram.propTypes = {
  hourly: PropTypes.array,
};
