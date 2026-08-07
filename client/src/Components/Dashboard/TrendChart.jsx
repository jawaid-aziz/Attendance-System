import PropTypes from "prop-types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Attendance-rate trend across the current month (percentage present per day).
export const TrendChart = ({ trend }) => {
  const data = (trend || []).map((entry) => ({
    ...entry,
    day: Number(entry.date.split("-")[2]),
  }));

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Attendance Trend
        </h3>
        <p className="text-sm text-slate-500">
          % of team present each day this month
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
          >
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#257eeb" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#257eeb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              minTickGap={20}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Attendance"]}
              labelFormatter={(label) => `Day ${label}`}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 13,
              }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#257eeb"
              strokeWidth={2.5}
              fill="url(#trendFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

TrendChart.propTypes = {
  trend: PropTypes.array,
};
