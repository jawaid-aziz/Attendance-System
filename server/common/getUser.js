const User= require("../models/User");
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
  
      res.status(200).json({
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
      res.status(500).json({ message: "Failed to fetch user", error: error.message });
    }
  };
  