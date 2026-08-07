const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstName: { type: String, required: true },
  // Day key (start of the working day in the company timezone). Used for the
  // unique (employee, day) constraint that prevents duplicate check-ins.
  day: { type: Date },
  date: { type: Date, required: true },
  checkIn: { type: Number, required: false, default: null },
  checkOut: { type: Number },
  checkInstatus: {
    type: String,
    enum: [
      "Present",
      "Absent",
      "Late Check-In",
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
      "Checked Out on Time",
    ],
  },
  deductions: { type: Number, default: 0 }, // Salary deductions for the day (currency amount)
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    index: true,
  },
});

// Prevent duplicate attendance rows for the same employee on the same day.
// Partial filter so pre-existing documents without a `day` key stay untouched.
AttendanceSchema.index(
  { employee: 1, day: 1 },
  { unique: true, partialFilterExpression: { day: { $exists: true } } }
);
AttendanceSchema.index({ employee: 1, date: -1 });
AttendanceSchema.index({ companyId: 1, date: -1 });

module.exports = mongoose.model("Attendance", AttendanceSchema);
