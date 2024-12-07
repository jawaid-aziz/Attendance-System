const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    firstName: { type: String, required: true },
    date: { type: Date, required: true },
    checkIn: { type: Number, required: true },
    checkOut: {type: Number },
    checkInstatus: { type: String, enum: ["Present", "Late Check-In (Half Leave)", "late check-out", "No Check-In", "No Check-Out"], default: "Present" },
    isActive: { type: Boolean }, // Track active status
    checkOutstatus: { type: String, enum: ["late check-out", "No Check-Out"] },
    deductions: { type: Number, default: 0 }, // Salary deductions for the day
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
