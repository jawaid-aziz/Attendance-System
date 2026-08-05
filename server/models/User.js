const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: "" },
  salary: { type: Number, default: 0 },
  address: { type: String, default: "" },
  password: { type: String, required: true },
  role: { type: String, required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    default: null,
    index: true,
  },
  setupToken: { type: String, default: null },
  setupTokenExpires: { type: Date, default: null },
});

module.exports = mongoose.model("User", UserSchema);
