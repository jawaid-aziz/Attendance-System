const jwt = require("jsonwebtoken");
// Function to generate a token
const generateToken = (user, role) => {
  return jwt.sign(
    { id: user._id, role: role, companyId: user.companyId || null }, // Payload
    process.env.JWT_SECRET,
    { expiresIn: "5h" }
  );
};

module.exports = { generateToken };
