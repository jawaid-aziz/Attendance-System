const Attendance = require("../../models/Attendance");
const dayjs = require("dayjs");

const getAttendanceStatus = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const serverTime = dayjs();
    const startOfToday = serverTime.startOf("day").toDate();
    const endOfToday = serverTime.endOf("day").toDate();

    // Find today's attendance
    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: startOfToday, $lt: endOfToday },
    });

    if (!attendance) {
      return res.status(200).json({ checkedIn: false, checkedOut: false });
    }

    res.status(200).json({
      checkedIn: !!attendance.checkIn,
      checkedOut: !!attendance.checkOut,
    });
  } catch (error) {
    console.error("Error fetching attendance status:", error);
    res.status(500).json({ message: "Error fetching attendance status", error: error.message });
  }
};

module.exports = getAttendanceStatus;
