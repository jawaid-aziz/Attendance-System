const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/tokenUtils");

const JWT_SECRET = process.env.JWT_SECRET || "secret-key";

// User Login
exports.loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  // Manual validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }
  if (!password || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  // const allowedRoles = ["admin", "employee"]; // Define allowed roles
  // if (!role || !allowedRoles.includes(role)) {
  //   return res
  //     .status(400)
  //     .json({
  //       message: `Role must be one of the following: ${allowedRoles.join(
  //         ", "
  //       )}`,
  //     });
  // }

  try {
    // Check if the user exists
    const user = await User.findOne({ email  });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const role=user.role;    

    const token =generateToken(user,role)

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        salary: user.salary,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login", error: error.message });
  }
};
