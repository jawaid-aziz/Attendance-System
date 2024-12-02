const jwt = require("jsonwebtoken");
const Employee = require("../models/User");

const verifyEmployee = async (req, res, next) => {
    console.log("veiasdf");

    const token = req.headers["authorization"]?.split(" ")[1]; // Remove 'Bearer' prefix if present
    if (!token) {
        return res.status(401).json({ message: "Token not found." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const employee = await Employee.findById(decoded.id);

        if (!employee) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        req.employee = employee;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token", error: error.message });
    }
};

module.exports = verifyEmployee;
