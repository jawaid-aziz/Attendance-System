const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstName: { type: String, required: true },
  date: { type: Date, required: true },
  checkIn: { type: Number, required: false, default: null },
  checkOut: { type: Number },
  checkInstatus: {
    type: String,
    enum: [
      "Present",
      "Absent",
      "Late Check-In (Half Leave)",
      "No Check-In (Full Leave)",
    ],
    default: "Present",
  },
  isActive: { type: Boolean, default: null }, // Track active status
  checkOutstatus: {
    type: String,
    enum: [
      "Late Check-Out",
      "No Check-Out",
      "Pending",
      "Check Out before Time",
    ],
  },
  deductions: { type: Number, default: 0 }, // Salary deductions for the day
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
