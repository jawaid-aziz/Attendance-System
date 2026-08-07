require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { startAbsentSweeper } = require("./utils/absentSweeper");
const logger = require("./utils/logger");
const authRoutes = require("./Routes/authRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const attendanceRoutes = require("./Routes/attendanceRoutes");
const commonRoutes = require("./Routes/commonRoutes");
const superadminRoutes = require("./Routes/superadminRoutes");

// Fail fast if critical secrets are missing or weak.
const validateEnv = () => {
  const problems = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    problems.push(
      "JWT_SECRET must be set and at least 32 characters long (generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\")"
    );
  }
  if (!process.env.MONGO_URL) {
    problems.push("MONGO_URL must be set (e.g. mongodb://localhost:27017/onTime)");
  }
  if (problems.length > 0) {
    logger.error(problems.join("\n"));
    process.exit(1);
  }
};
validateEnv();

const app = express();

// Trust the first proxy so req.ip / X-Forwarded-For are reliable when the
// app runs behind a reverse proxy or load balancer. Only enable when actually
// deployed behind a trusted proxy — otherwise a direct client can spoof
// X-Forwarded-For to bypass IP-based rate limiting and office-IP checks.
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

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

// Request logger with a per-request id so logs can be correlated.
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  const started = Date.now();
  res.on("finish", () => {
    logger.info(
      `id=${req.id} ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`
    );
  });
  next();
});

// Liveness/readiness probe for deployments and load balancers.
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const healthy = dbState === 1;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    db: ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown",
    uptime: Math.round(process.uptime()),
  });
});

// Auth endpoints are public and brute-force targets; throttle them.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: parseInt(process.env.RATE_LIMIT_AUTH || "100", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: parseInt(process.env.RATE_LIMIT_LOGIN || "10", 10),
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
  logger.error(`id=${req.id} Unhandled error:`, err);
  res.status(500).json({ message: "Internal server error" });
});

const start = async () => {
  try {
    await connectDB();
    // Single-worker background job (enable on exactly one instance).
    startAbsentSweeper();
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      server.close(() => {
        logger.info("HTTP server closed.");
        process.exit(0);
      });
      // Force-exit if connections refuse to drain
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
};

module.exports = { app, start };

// Start only when run directly (tests import `app` without booting).
if (require.main === module) {
  start();
}

