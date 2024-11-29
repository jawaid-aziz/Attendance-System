const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  salary: { type: Number, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true }, 
});

module.exports = mongoose.model("Employee", employeeSchema);
