const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/tokenUtils");

// User Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

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

  try {
    // Check if the user exists with the given email and role
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user, user.role);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
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

// User Signup
exports.signupUser = async (req, res) => {
  const { firstName, lastName, email, phone, salary, address, password, role } =
    req.body;

  // Manual validation
  if (!firstName || firstName.length < 2) {
    return res
      .status(400)
      .json({ message: "First name must be at least 2 characters long" });
  }
  if (!lastName || lastName.length < 2) {
    return res
      .status(400)
      .json({ message: "Last name must be at least 2 characters long" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }
  const phoneRegex = /^[0-9]{8,15}$/;
  if (!phone || !phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }
  if (!salary || isNaN(salary) || salary <= 0) {
    return res.status(400).json({ message: "Salary must be a positive number" });
  }
  if (!address || address.trim().length < 5) {
    return res
      .status(400)
      .json({ message: "Address must be at least 5 characters long" });
  }
  if (!password || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }
  const allowedRoles = ["admin", "employee"];
  const userRole = role || "employee";
  if (!allowedRoles.includes(userRole)) {
    return res
      .status(400)
      .json({ message: `Role must be one of the following: ${allowedRoles.join(", ")}` });
  }

  try {
    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      salary,
      address,
      password: hashedPassword,
      role: userRole,
    });

    await newUser.save();

    const token = generateToken(newUser, newUser.role);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        email: newUser.email,
        phone: newUser.phone,
        salary: newUser.salary,
        address: newUser.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to signup", error: error.message });
  }
};
