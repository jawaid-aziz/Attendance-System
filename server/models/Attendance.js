const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: { type: String, enum: ["Present", "Late Check-In (Half Leave)", "late check-out", "No Check-In", "No Check-Out"], default: "Present" },
    deductions: { type: Number, default: 0 }, // Salary deductions for the day
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
