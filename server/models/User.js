const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  role: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema, "User"); // Third argument is the exact collection name
