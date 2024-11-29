const bcrypt = require("bcryptjs");
const User = require("../../models/User");

// Add User Controller
exports.addUser = async (req, res) => {
  const { firstName, lastName, email, phone, salary, address, password, role } = req.body;

  // Manual Validation
  if (!firstName || firstName.length < 2) {
    return res.status(400).json({ message: "First name must be at least 2 characters long" });
  }
  if (!lastName || lastName.length < 2) {
    return res.status(400).json({ message: "Last name must be at least 2 characters long" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }
  const phoneRegex = /^[0-9]{8,15}$/; // Accepts 10-15 digit phone numbers
  if (!phone || !phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }
  if (!salary || isNaN(salary) || salary <= 0) {
    return res.status(400).json({ message: "Salary must be a positive number" });
  }
  if (!address || address.trim().length < 5) {
    return res.status(400).json({ message: "Address must be at least 5 characters long" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }
  const allowedRoles = ["admin", "employee"]; // Define allowed roles
  if (!role || !allowedRoles.includes(role)) {
    return res.status(400).json({ message: `Role must be one of the following: ${allowedRoles.join(", ")}` });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user object
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      salary,
      address,
      password: hashedPassword,
      role,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({
      message: "User added successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        salary: newUser.salary,
        address: newUser.address,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add user", error: error.message });
  }
};
