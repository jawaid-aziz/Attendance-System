const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  role: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", UserSchema, "User"); // Third argument is the exact collection name
