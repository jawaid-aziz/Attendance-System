const jwt = require("jsonwebtoken");
// Function to generate a token
const generateToken = (user, role) => {
  return jwt.sign(
    { id: user._id, role: role }, // Payload
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

module.exports = { generateToken };
