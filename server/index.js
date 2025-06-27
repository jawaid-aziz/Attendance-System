require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const authRoutes = require("./Routes/authRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const attendanceRoutes = require("./Routes/attendanceRoutes");
const commonRoutes = require("./Routes/commonRoutes")
const projectRoutes = require("./Routes/projectRoutes")
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Socket.IO initialization
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

// Attach io to routes
app.use("/attend", (req, res, next) => {
  req.io = io;
  next();
}, attendanceRoutes);

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/byId", commonRoutes);
app.use("/projects", projectRoutes);
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

// Export server and io together
module.exports = { server, io };

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});