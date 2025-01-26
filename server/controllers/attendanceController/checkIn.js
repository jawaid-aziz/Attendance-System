const Attendance = require("../../models/Attendance");
const User = require("../../models/User");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");
const mongoose = require("mongoose");
const cron = require("node-cron");

dayjs.extend(timezone);
dayjs.extend(utc);

const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Validate employee ID
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const io = req.io;
    if (!io) {
      console.error("Socket.IO instance is not available on req.");
    }

    const timezoneName = process.env.TIMEZONE || "Asia/Karachi";
    const serverTime = dayjs().tz(timezoneName);
    const unixTime = serverTime.unix(); // Convert to seconds since epoch
    const today = serverTime.format("dddd");

    console.log("Server Time:", serverTime.format());
    console.log("Unix Time:", unixTime);
    console.log("Timezone:", timezoneName);

    //   const workStartHour = parseInt(process.env.OFFICE_SCHEDULE); // Default 9 AM
    //  const todaySchedule= workStartHour[today];
    //   const workEndHour = parseInt(process.env.OFFICE_SCHEDULE) ; // Default 5 PM
    //   const todayScheduleEnd= workEndHour[today];

    //   const checkInHour = serverTime.hour();
    //   const checkInMinute = serverTime.minute();

    //   // Validate working hours
    //   const isWorkingHour =
    //     checkInHour >= todaySchedule?.startTime && checkInHour < todayScheduleEnd?.endTime;

    //   if (!isWorkingHour) {
    //     return res
    //       .status(400)
    //       .json({ message: "Check-in time is outside working hours." });
    //   }

    //   const startOfDay = serverTime.startOf("day").toDate();
    //   const endOfDay = serverTime.endOf("day").toDate();

    //   const existingAttendance = await Attendance.findOne({
    //     employee: employeeId,
    //     date: { $gte: startOfDay, $lt: endOfDay },
    //   });

    //   if (existingAttendance) {
    //     return res
    //       .status(400)
    //       .json({ message: "You have already checked in today." });
    //   }

    //   const employee = await User.findById(employeeId);

    //   if (!employee) {
    //     return res.status(404).json({ message: "Employee not found" });
    //   }

    //   const firstName = employee.firstName;

    //   // Fetch deductions settings
    //   const deductionsEnabled = process.env.DEDUCTIONS_ENABLED === "true";
    //   const deductionRate = parseFloat(process.env.DEDUCTION_RATE) || 0;

    //   console.log("Deductions Enabled:", deductionsEnabled);
    //   console.log("Deduction Rate:", deductionRate);

    //   // Determine status and deductions
    //   let checkInstatus = "Present";
    //   let deductions = 0;

    //   if (deductionsEnabled) {
    //     if (checkInHour === workStartHour && checkInMinute > 15) {
    //       checkInstatus = "Late Check-In (Half Leave)";
    //       deductions = deductionRate / 3; // Deduction logic based on rate
    //     } else if (checkInHour > workStartHour) {
    //       checkInstatus = "Late Check-In (Half Leave)";
    //       deductions = deductionRate / 3; // Deduction logic based on rate
    //     }
    //   }
    // Parse OFFICE_SCHEDULE from .env
    const officeSchedule = JSON.parse(process.env.OFFICE_SCHEDULE || "{}");

    // Retrieve today's schedule
    const todaySchedule = officeSchedule[today];

    if (!todaySchedule) {
      return res
        .status(400)
        .json({ message: "Office schedule is not configured for today." });
    }

    if (!todaySchedule.isOpen) {
      return res.status(400).json({ message: "The office is closed today." });
    }

    const [startHour, startMinute] = todaySchedule.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = todaySchedule.endTime.split(":").map(Number);

    const checkInHour = serverTime.hour();
    const checkInMinute = serverTime.minute();

    // Validate working hours
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    const currentMinutes = checkInHour * 60 + checkInMinute;

    const isWorkingHour =
      currentMinutes >= startTimeMinutes && currentMinutes <= endTimeMinutes;

    if (!isWorkingHour) {
      return res
        .status(400)
        .json({ message: "Check-in time is outside working hours." });
    }

    const startOfDay = serverTime.startOf("day").toDate();
    const endOfDay = serverTime.endOf("day").toDate();

    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existingAttendance) {
      return res
        .status(400)
        .json({ message: "You have already checked in today." });
    }

    const employee = await User.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const firstName = employee.firstName;

    // Fetch deductions settings
    const deductionsEnabled = process.env.DEDUCTIONS_ENABLED === "true";
    const deductionRate = parseFloat(process.env.DEDUCTION_RATE) || 0;

    console.log("Deductions Enabled:", deductionsEnabled);
    console.log("Deduction Rate:", deductionRate);

    // Determine status and deductions
    let checkInstatus = "Present";
    let deductions = 0;

    if (deductionsEnabled) {
      if (currentMinutes > startTimeMinutes + 15) {
        checkInstatus = "Late Check-In (Half Leave)";
        deductions = deductionRate / 3; // Deduction logic based on rate
      }
    }

    // Create and save attendance record
    const attendance = new Attendance({
      employee: employeeId,
      firstName: firstName,
      date: serverTime,
      checkIn: unixTime,
      checkInstatus,
      isActive: true,
      deductions,
    });

    await attendance.save();

    // Emit status update via Socket.IO
    if (io) {
      io.emit("status update", {
        employeeId: employeeId.toString(),
        isActive: true,
      });
      console.log("Emitting employee ID:", employeeId.toString());
    }

    res.status(200).json({
      message: "Check-in successful",
      attendance,
    });
  } catch (error) {
    console.error("Error in check-in:", error);
    res
      .status(500)
      .json({ message: "Error in check-in", error: error.message });
  }
};

const markAbsentForNonCheckIns = async () => {
  try {
    const timezoneName = process.env.TIMEZONE || "Asia/Karachi";
    const serverTime = dayjs().tz(timezoneName);
    const today = serverTime.format("dddd");

    // Fetch office schedule
    const officeSchedule = JSON.parse(process.env.OFFICE_SCHEDULE || "{}");
    const todaySchedule = officeSchedule[today];

    if (!todaySchedule?.isOpen) {
      console.log(`Skipping absent marking. Office is closed on ${today}.`);
      return;
    }

    // Proceed with marking absentees if the office is open
    const unattendedEmployeeIds = await User.find({
      _id: {
        $nin: await Attendance.distinct("employee", {
          date: {
            $gte: serverTime.startOf("day").toDate(),
            $lt: serverTime.endOf("day").toDate(),
          },
        }),
      },
    }).select("_id firstName");

    if (unattendedEmployeeIds.length === 0) {
      console.log("No unattended employees found.");
      return;
    }

    const absentRecords = unattendedEmployeeIds.map((employee) => ({
      employee: employee._id,
      firstName: employee.firstName,
      date: serverTime.toDate(),
      checkIn: null,
      checkInstatus: "Absent",
      isActive: false,
      deductions: parseFloat(process.env.DEDUCTION_RATE) || 0,
    }));

    await Attendance.insertMany(absentRecords);
    console.log(`Marked ${absentRecords.length} employees absent.`);
  } catch (error) {
    console.error("Error marking absentees:", error);
  }
};

// Schedule job to run at 6 PM PST daily
cron.schedule(
  "8 18 * * *",
  async () => {
    try {
      await markAbsentForNonCheckIns();
    } catch (error) {
      console.error("Cron job error:", error);
    }
  },
  { timezone: process.env.TIMEZONE || "Asia/Karachi" }
);

module.exports = checkIn;
