const Attendance = require("../../models/Attendance");
const User = require("../../models/User");
const { dayjs, getCompanyTimezone } = require("../../utils/dayjs");
const logger = require("../../utils/logger");

const LATE_STATUS = "Late Check-In (Half Leave)";
const ABSENT_STATUSES = ["Absent", "No Check-In (Full Leave)"];

// Resolve today's per-employee attendance status from a day's attendance rows.
const buildEmployeeStatusMap = (rows) => {
  const statusMap = new Map();
  for (const row of rows) {
    const key = row.employee.toString();
    let status;
    if (!row.checkIn) {
      status = ABSENT_STATUSES.includes(row.checkInstatus)
        ? "absent"
        : "not-checked-in";
    } else if (row.checkInstatus === LATE_STATUS) {
      status = "late";
    } else if (row.isActive === true) {
      status = "in-office";
    } else if (row.isActive === false) {
      status = "checked-out";
    } else {
      status = "in-office";
    }
    statusMap.set(key, status);
  }
  return statusMap;
};

// Company-scoped dashboard aggregate for the admin home: today's status
// summary, current month trend, today's hourly check-in histogram,
// month-to-date deductions and the per-employee live status list.
const getDashboard = async (req, res) => {
  try {
    const company = req.company;
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }

    const timezoneName = getCompanyTimezone(company);
    const now = dayjs().tz(timezoneName);
    const todayStart = now.startOf("day").toDate();
    const tomorrow = now.add(1, "day").startOf("day").toDate();
    const monthStart = now.startOf("month").toDate();

    const [
      totalEmployees,
      todayRows,
      trendAgg,
      deductionAgg,
      users,
    ] = await Promise.all([
      User.countDocuments({
        companyId: company._id,
        role: { $in: ["employee", "admin"] },
      }),
      Attendance.find({
        companyId: company._id,
        day: { $gte: todayStart, $lt: tomorrow },
      }).lean(),
      Attendance.aggregate([
        {
          $match: {
            companyId: company._id,
            day: { $gte: monthStart, $lt: tomorrow },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                date: "$day",
                format: "%Y-%m-%d",
                timezone: timezoneName,
              },
            },
            present: {
              $sum: { $cond: [{ $ne: ["$checkIn", null] }, 1, 0] },
            },
            late: {
              $sum: { $cond: [{ $eq: ["$checkInstatus", LATE_STATUS] }, 1, 0] },
            },
          },
        },
      ]),
      Attendance.aggregate([
        {
          $match: {
            companyId: company._id,
            day: { $gte: monthStart, $lt: tomorrow },
          },
        },
        { $group: { _id: null, total: { $sum: "$deductions" } } },
      ]),
      User.find({
        companyId: company._id,
        role: { $in: ["employee", "admin"] },
      })
        .select("_id firstName lastName role")
        .sort({ firstName: 1, lastName: 1 })
        .lean(),
    ]);

    // Today's summary counts.
    const today = { present: 0, late: 0, inOffice: 0, checkedOut: 0 };
    for (const row of todayRows) {
      if (row.checkIn) today.present += 1;
      if (row.checkInstatus === LATE_STATUS) today.late += 1;
      if (row.isActive === true) today.inOffice += 1;
      else if (row.isActive === false) today.checkedOut += 1;
    }
    today.notCheckedIn = Math.max(0, totalEmployees - today.present);

    // Current month trend, one entry per day up to today.
    const trendMap = new Map(trendAgg.map((d) => [d._id, d]));
    const trend = [];
    const yearMonth = now.format("YYYY-MM");
    for (let dayNum = 1; dayNum <= now.date(); dayNum++) {
      const key = `${yearMonth}-${String(dayNum).padStart(2, "0")}`;
      const agg = trendMap.get(key);
      const present = agg?.present || 0;
      const late = agg?.late || 0;
      const absent = Math.max(0, totalEmployees - present);
      trend.push({
        date: key,
        total: totalEmployees,
        present,
        late,
        absent,
        rate: totalEmployees
          ? Number(((present / totalEmployees) * 100).toFixed(1))
          : 0,
      });
    }

    // Today's hourly check-in distribution (company timezone).
    const hourly = [];
    const hourCounts = {};
    for (const row of todayRows) {
      if (!row.checkIn) continue;
      const hour = dayjs.unix(row.checkIn).tz(timezoneName).hour();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
    for (let hour = 0; hour < 24; hour++) {
      if (hourCounts[hour]) hourly.push({ hour, count: hourCounts[hour] });
    }

    const statusMap = buildEmployeeStatusMap(todayRows);
    const employees = users.map((user) => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: statusMap.get(user._id.toString()) || "not-checked-in",
    }));

    res.status(200).json({
      totalEmployees,
      today,
      monthToDateDeductions: deductionAgg[0]?.total || 0,
      trend,
      hourly,
      employees,
    });
  } catch (error) {
    logger.error("Error fetching dashboard:", error.message);
    res.status(500).json({ message: "Error fetching dashboard" });
  }
};

module.exports = { getDashboard };
