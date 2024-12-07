const Employee = require("../../models/Attendance");

const statusAPI = async (req, res) => {
  try {
    // Fetch all employees with their isActive status
    const employees = await Employee.find(
    {},
      "firstName lastName isActive"
    );

    if (!employees) {
      return res.status(404).json({ message: "No employees found" });
    }

    res.status(200).json({
      message: "Employee statuses fetched successfully",
      employees,
    });
  } catch (error) {
    console.error("Error fetching employee statuses:", error);
    res.status(500).json({ message: "Error fetching employee statuses", error: error.message });
  }
};

module.exports = statusAPI;
