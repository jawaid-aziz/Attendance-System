// Test bootstrap: set safe env defaults BEFORE the app module is required.
// dotenv won't override existing vars, so these win over server/.env.
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-that-is-longer-than-thirty-two-characters!";
process.env.RATE_LIMIT_LOGIN = process.env.RATE_LIMIT_LOGIN || "1000";
process.env.RATE_LIMIT_AUTH = process.env.RATE_LIMIT_AUTH || "1000";
process.env.SKIP_EMAIL = "true";
process.env.IP_ENFORCEMENT = "off";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// index.js only auto-starts when run directly, so requiring it here yields a
// fully-wired Express app without opening a port or connecting to Mongo.
const { app } = require("../../index.js");

module.exports = { app };
