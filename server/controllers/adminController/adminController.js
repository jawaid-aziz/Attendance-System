const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Attendance = require("../../models/Attendance");
// Get Users Controller
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    const employees = await Promise.all(
      users.map(async (user) => {
        // Find the most recent attendance record
        const attendance = await Attendance.findOne({ employee: user._id }).sort({ date: -1 });

        // Determine status based on attendance record
        let isActive = null; // Default to null
        if (attendance) {
          const today = new Date().toISOString().split("T")[0]; // Current date in "YYYY-MM-DD"
          const attendanceDate = new Date(attendance.date).toISOString().split("T")[0];

          if (attendanceDate === today) {
            // If the latest attendance record is for today
            isActive = attendance.isActive ?? null; // Use `isActive`, fallback to null
          } else {
            // If the latest attendance record is not for today, mark as null (not checked in today)
            isActive = null;
          }
        }
        console.log("isActive satatus:",isActive);

        // Return user with computed attendance status
        return {
          _id: user._id,
          firstName: user.firstName,
          role: user.role,
          isActive: isActive,
        };
        
      })
    );

    res.status(200).json({ employees });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};


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

// Edit User Controller
exports.editUser = async (req, res) => {
  const { firstName, lastName, email, phone, salary, address, password, role } = req.body;

  // Check if user ID is provided in URL params
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  // Manual Validation
  if (firstName && firstName.length < 2) {
    return res.status(400).json({ message: "First name must be at least 2 characters long" });
  }
  if (lastName && lastName.length < 2) {
    return res.status(400).json({ message: "Last name must be at least 2 characters long" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }
  const phoneRegex = /^[0-9]{8,15}$/;
  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }
  if (salary && (isNaN(salary) || salary <= 0)) {
    return res.status(400).json({ message: "Salary must be a positive number" });
  }
  if (address && address.trim().length < 5) {
    return res.status(400).json({ message: "Address must be at least 5 characters long" });
  }
  if (password && password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }
  const allowedRoles = ["admin", "employee"];
  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json({ message: `Role must be one of the following: ${allowedRoles.join(", ")}` });
  }

  try {
    // Find the existing user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (salary) user.salary = salary;
    if (address) user.address = address;
    if (role) user.role = role;

    // Hash the new password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Save the updated user object to the database
    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        salary: user.salary,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

// Delete User Controller
exports.deleteUser = async (req, res) => {
  const userId = req.params.id; // Assuming user ID is passed as a route parameter

  // Check if user ID is provided
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Find and delete the user by ID
    const user = await User.findByIdAndDelete(userId);

    // If user not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with success
    res.status(200).json({
      message: "User deleted successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        salary: user.salary,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};
