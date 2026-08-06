require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { startAbsentSweeper } = require("./utils/absentSweeper");
const authRoutes = require("./Routes/authRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const attendanceRoutes = require("./Routes/attendanceRoutes");
const commonRoutes = require("./Routes/commonRoutes");
const superadminRoutes = require("./Routes/superadminRoutes");

// Fail fast if critical secrets are missing or weak.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    "JWT_SECRET must be set and at least 32 characters long (generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\")"
  );
  process.exit(1);
}

const app = express();

// Trust the first proxy so req.ip / X-Forwarded-For are reliable when the
// app runs behind a reverse proxy or load balancer.
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// Lock CORS down to configured origins (dev default is the Vite dev server).
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(bodyParser.json({ limit: "1mb" }));

// Minimal request logger
app.use((req, res, next) => {
  const started = Date.now();
  res.on("finish", () => {
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`
    );
  });
  next();
});

// Auth endpoints are public and brute-force targets; throttle them.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});

app.use("/auth/register", authLimiter);
app.use("/auth/login", loginLimiter);

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/attend", attendanceRoutes);
app.use("/byId", commonRoutes);
app.use("/superadmin", superadminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const start = async () => {
  try {
    await connectDB();
    // Single-worker background job (enable on exactly one instance).
    startAbsentSweeper();
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down gracefully...`);
      server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });
      // Force-exit if connections refuse to drain
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
