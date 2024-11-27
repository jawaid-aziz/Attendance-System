const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Normalize IP addresses

// Static IPs allowed to log in
const allowedIps = ["192.168.1.16"]; // Replace with actual office IPs

// Mock database
const users = [
  { id: "1", email: "john@example.com", password: "123456" },
  { id: "2", email: "jane@example.com", password: "password" },
];

// Login Route
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  let userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (userIp === "::1" || userIp === "127.0.0.1") {
    userIp = "192.168.1.16"; // Replace with your actual local IP for testing
  }
  
  console.log("Captured IP:", userIp);
  // Check if the IP is allowed
  if (!allowedIps.includes(userIp)) {
    return res.status(403).json({ message: "Unauthorized IP address" });
  }

  // Verify user credentials
  const user = users.find((u) => u.email === email && u.password === password);
  console.log("Matched User:", user);
  if (user) {
    console.log("Login successful!");
    return res.status(200).json({
      success: true,
      user: { id: user.id, email: user.email },
    });
  } else {
    console.error("Invalid credentials");
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

module.exports = router;
