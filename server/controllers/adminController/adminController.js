const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Attendance = require("../../models/Attendance");
const Company = require("../../models/Company");
const { dayjs, getCompanyTimezone } = require("../../utils/dayjs");
const { isStrongPassword } = require("../../common/password");
const {
  createUserWithSetupToken,
  setupLinkFor,
} = require("../../common/onboarding");
const { isSameCompany, isCompanyActive } = require("../../common/company");
const { sendSetupLinkEmail } = require("../../utils/sendMail");
const { withTransaction } = require("../../utils/withTransaction");

const mongoose = require("mongoose");
const logger = require("../../utils/logger");

// Get Users Controller
exports.getUsers = async (req, res) => {
  try {
    // Company admins see only their own employees; superadmins see all
    const scopeCompanyId = req.user.companyId || req.query.companyId;
    if (!scopeCompanyId) {
      return res.status(400).json({ message: "No company context." });
    }

    const company = await Company.findById(scopeCompanyId);
    if (!company || !isCompanyActive(company)) {
      return res.status(400).json({ message: "Company not found or inactive" });
    }
    const todayStart = dayjs()
      .tz(getCompanyTimezone(company))
      .startOf("day")
      .toDate();

    // Single aggregation instead of N+1 per-user attendance lookups. The
    // $lookup uses an equality join (index-served by the { employee, day }
    // index) rather than a correlated $expr scan.
    const employees = await User.aggregate([
      { $match: { companyId: company._id } },
      {
        $lookup: {
          from: "attendances",
          localField: "_id",
          foreignField: "employee",
          pipeline: [{ $sort: { day: -1 } }, { $limit: 1 }],
          as: "lastAttendance",
        },
      },
      {
        $addFields: {
          lastAttendance: { $arrayElemAt: ["$lastAttendance", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          role: 1,
          isActive: {
            $cond: [
              {
                $and: [
                  { $ne: ["$lastAttendance", null] },
                  { $eq: ["$lastAttendance.day", todayStart] },
                ],
              },
              "$lastAttendance.isActive",
              null,
            ],
          },
        },
      },
      { $sort: { firstName: 1 } },
    ]);

    res.status(200).json({ employees });
  } catch (error) {
    logger.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Add User Controller
exports.addUser = async (req, res) => {
  const { firstName, lastName, email, phone, salary, address, role } = req.body;

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
  const phoneRegex = /^[0-9]{8,15}$/; // Accepts 8-15 digit phone numbers
  if (!phone || !phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }
  const salaryNumber = Number(salary);
  if (!Number.isFinite(salaryNumber) || salaryNumber < 0) {
    return res.status(400).json({ message: "Salary must be a non-negative number" });
  }
  if (!address || address.trim().length < 5) {
    return res.status(400).json({ message: "Address must be at least 5 characters long" });
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

    // Company admins add to their own company; superadmins pass companyId
    const companyId =
      req.user.role === "superadmin" ? req.body.companyId : req.user.companyId;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const company = await Company.findById(companyId);
    if (!company || !isCompanyActive(company)) {
      return res.status(400).json({ message: "Company not found or inactive" });
    }

    // The user sets their own password via an emailed one-time setup link.
    const { user: newUser, setupToken } = await createUserWithSetupToken({
      firstName,
      lastName,
      email,
      phone,
      salary: salaryNumber,
      address,
      role,
      companyId,
    });

    // Send a one-time setup link via email
    const link = setupLinkFor(setupToken);
    let emailFailed = false;
    try {
      await sendSetupLinkEmail(email, `${firstName} ${lastName}`, link);
    } catch (error) {
      logger.error("Failed to send setup email:", error.message);
      emailFailed = true;
    }

    res.status(201).json({
      message: emailFailed
        ? "User added successfully, but the setup email could not be sent."
        : "User added successfully. A setup link was sent to their email.",
      emailFailed,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        salary: newUser.salary,
        address: newUser.address,
        role: newUser.role,
        companyId: newUser.companyId,
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Failed to add user" });
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
  if (salary !== undefined && (!Number.isFinite(Number(salary)) || Number(salary) < 0)) {
    return res.status(400).json({ message: "Salary must be a non-negative number" });
  }
  if (address && address.trim().length < 5) {
    return res.status(400).json({ message: "Address must be at least 5 characters long" });
  }
  if (password && !isStrongPassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters with a letter and a number" });
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

    // Company admins can only edit users inside their company
    if (
      req.user.role !== "superadmin" &&
      !isSameCompany(req.user.companyId, user.companyId)
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: Cannot edit users outside your company" });
    }

    // Guard against taking over another account's email
    if (email && email !== user.email) {
      const emailTaken = await User.exists({ email, _id: { $ne: userId } });
      if (emailTaken) {
        return res
          .status(400)
          .json({ message: "A user with this email already exists" });
      }
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (salary !== undefined) user.salary = Number(salary);
    if (address) user.address = address;
    if (role) {
      user.role = role;
      // Role changes revoke previously issued JWTs.
      user.version = (user.version || 0) + 1;
    }

    // Hash the new password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.version = (user.version || 0) + 1;
    }

    // Save the updated user object to the database
    await user.save();

    // Keep the denormalized name on attendance rows in sync on rename.
    if (firstName || lastName) {
      await Attendance.updateMany(
        { employee: user._id },
        { $set: { firstName: user.firstName } }
      );
    }

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
    logger.error(error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

// Delete User Controller
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  // Check if user ID is provided
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  // Validate the format of the ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID format" });
  }

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Refuse self-deletion
    if (user._id.toString() === req.user.id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    // Company admins can only delete users inside their company
    if (
      req.user.role !== "superadmin" &&
      !isSameCompany(req.user.companyId, user.companyId)
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: Cannot delete users outside your company" });
    }

    // Never delete the company's last admin
    if (user.role === "admin" && user.companyId) {
      const adminCount = await User.countDocuments({
        companyId: user.companyId,
        role: "admin",
      });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot delete the last admin of the company" });
      }
    }

    // Delete the user and their attendance atomically.
    const { attendanceDeletedCount } = await withTransaction(async (session) => {
      await User.deleteOne({ _id: user._id }, session ? { session } : {});
      const result = await Attendance.deleteMany(
        { employee: user._id },
        session ? { session } : {}
      );
      return { attendanceDeletedCount: result.deletedCount };
    });

    res.status(200).json({
      message: "User and associated attendance records deleted successfully",
      deletedUser: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        salary: user.salary,
        address: user.address,
        role: user.role,
      },
      attendanceDeletedCount,
    });
  } catch (error) {
    logger.error("Error deleting user and attendance records:", error);
    res.status(500).json({ message: "Failed to delete user and attendance records" });
  }
};
