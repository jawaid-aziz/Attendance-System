
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const authRoutes=require("./Routes/authRoutes")
const employeeRoutes=require("./Routes/employeeRoutes")
const adminRoutes=require("./Routes/adminRoutes")

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/auth",authRoutes);
app.use("/employee",employeeRoutes);
// app.use("/admin",adminRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
