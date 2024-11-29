const Employee = require("../models/Employee");

const getAllEmployee = async (req, res) => { 
    try {
        const employees = await Employee.find(); // Fetch all employees
        res.status(200).json({ message: "Employees fetched successfully", employees });
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ message: "Error fetching employee records", error: error.message });
    }
};

module.exports = getAllEmployee;
