const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    salary: { type: Number, default: 0 },
    address: { type: String, default: "" },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["employee", "admin", "superadmin"],
      default: "employee",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true,
    },
    setupToken: { type: String, default: null },
    setupTokenExpires: { type: Date, default: null },
    // Bumped on role/password changes so previously issued JWTs are invalidated.
    version: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Setup tokens are looked up on every setup-link click; make it unique+sparse.
UserSchema.index({ setupToken: 1 }, { unique: true, sparse: true });
// Per-company role filters (admin employee lists, absent sweeper).
UserSchema.index({ companyId: 1, role: 1 });
// Superadmin listing.
UserSchema.index({ role: 1 });

module.exports = mongoose.model("User", UserSchema);
