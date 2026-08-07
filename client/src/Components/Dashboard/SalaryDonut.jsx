import PropTypes from "prop-types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { formatMoney } from "@/lib/format";

const COLORS = {
  net: "#16a34a",
  deductions: "#ef4444",
};

// Monthly take-home vs. deductions donut with a running breakdown beside it.
export const SalaryDonut = ({ monthlySalary, totalDeductions, netSalary }) => {
  const monthly = Number(monthlySalary) || 0;
  const deductions = Number(totalDeductions) || 0;

  if (monthly <= 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
        Salary is not set for your profile yet.
      </div>
    );
  }

  const data = [
    { name: "Take-home", value: Math.max(0, monthly - deductions), color: COLORS.net },
    { name: "Deductions", value: deductions, color: COLORS.deductions },
  ];

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">This Month&apos;s Pay</h3>
        <p className="text-sm text-slate-500">Monthly salary vs. deductions</p>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={3}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatMoney(value)}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[11px] font-medium text-slate-500">Net</p>
            <p className="text-sm font-bold text-slate-900">
              {formatMoney(netSalary)}
            </p>
          </div>
        </div>

        <div className="w-full space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS.net }}
              />
              Monthly salary
            </span>
            <span className="font-semibold text-slate-900">
              {formatMoney(monthly)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS.deductions }}
              />
              Deductions
            </span>
            <span className="font-semibold text-red-600">
              −{formatMoney(deductions)}
            </span>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-600">Net payable</span>
              <span className="text-lg font-bold text-slate-900">
                {formatMoney(netSalary)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SalaryDonut.propTypes = {
  monthlySalary: PropTypes.number,
  totalDeductions: PropTypes.number,
  netSalary: PropTypes.number,
};
