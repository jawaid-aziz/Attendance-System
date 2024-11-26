// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const userR = require("./Routes/userRoutes"); // Correct file path
// // Import user routes

// const app = express();

// // Middleware
// // app.use(cors()); // Allow cross-origin requests
// // const cors = require("cors");
// app.use(cors({ origin: "http://localhost:5173" }));

// app.use(bodyParser.json()); // Parse JSON bodies

// // Routes
// app.use("/userRoutes", userR); // Mount the user routes

// // Server Configuration
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/auth", require("./Routes/authRoutes"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
