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
    deductionRate: { type: Number, default: 0 },
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
