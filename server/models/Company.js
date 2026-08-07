const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    totalEmployees: { type: Number, default: 0 },
    timezone: { type: String, default: "Asia/Karachi" },
    officeSchedule: { type: mongoose.Schema.Types.Mixed, default: {} },
    deductionEnabled: { type: Boolean, default: false },
    // Per-scenario deduction rates as a % of a day's salary (daily = monthly / 30).
    deductionConfig: {
      lateCheckInRate: { type: Number, default: 50 },
      noCheckOutRate: { type: Number, default: 50 },
      absentRate: { type: Number, default: 100 },
      lateGraceMinutes: { type: Number, default: 15 },
      noCheckOutGraceHours: { type: Number, default: 2 },
    },
    allowedRouterIPs: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "deleted"],
      default: "active",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Services the hourly sweeper ({ status: "active" }) and the tenant list
// ({ status: { $ne: "deleted" } }, sort by createdAt desc).
CompanySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Company", CompanySchema);
