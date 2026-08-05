const User = require("../models/User");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const serializeUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  salary: user.salary,
  address: user.address,
  role: user.role,
  companyId: user.companyId || null,
});

exports.getUserById = async (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSelf = user._id.toString() === req.user.id;
    const sameCompany =
      req.user.companyId &&
      user.companyId &&
      req.user.companyId.toString() === user.companyId.toString();
    const isSuperadmin = req.user.role === "superadmin";

    if (!isSelf && !sameCompany && !isSuperadmin) {
      return res
        .status(403)
        .json({ message: "Forbidden: Cannot access this user" });
    }

    res.status(200).json({
      user: serializeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

// Resolve a user from a URL-safe "first-last" name slug (e.g. "john-doe").
// Used for readable profile URLs that carry no raw id. Best-effort match:
// first segment matches firstName, the rest matches lastName. Falls back to a
// firstName-only match, then to firstName+lastName matching (users whose
// lastName defaults to their firstName).
exports.getUserByName = async (req, res) => {
  const { name } = req.params;
  const parts = (name || "").split("-").filter(Boolean);
  if (!parts.length) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const scope =
      req.user.role === "superadmin" ? {} : { companyId: req.user.companyId };
    const firstRegex = new RegExp(`^${escapeRegex(parts[0])}$`, "i");

    const matches = await User.find({ ...scope, firstName: firstRegex });
    let user = null;

    if (parts.length > 1) {
      const last = parts.slice(1).join("-");
      const lastRegex = new RegExp(`^${escapeRegex(last)}$`, "i");
      user =
        matches.find((u) => u.lastName && lastRegex.test(u.lastName)) ||
        matches.find((u) => u.lastName === u.firstName) ||
        matches[0];
    } else {
      user = matches[0];
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: serializeUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};
