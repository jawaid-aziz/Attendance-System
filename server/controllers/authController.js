const userModel = require("../models/User");
const employeeModel= require("../models/Employee")
 const Token= require("../utils/jwt")
// const EmployeeModel= require("../models/Employee");
exports.login = async (req, res) => {
    const { role,email, password } = req.body;
    
    try {
        if(!role ) 
            return res.status(400).json({message:"put role first"});
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        console.log("Received credentials:", { role,email, password });

        const user = await userModel.findOne({ role:role, email: email });
        console.log("Query result:", user);

        if (!user) {
            console.log("Not found for email:", email);
        } 
        // else if (user.role !==role) {
        //      console.log("role mismatched");
        
         else if (user.password !== password) {
            console.log("Password mismatch");
        }

        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid role or email or password" });
        }
        const token = Token.generateToken(user);
        if (user.role === "admin") {
            return res.status(200).json({ message: "Admin login successful.", token });
        } else if (user.role === "user") {
            // Verify employee existence in Employee collection
            const employee = await employeeModel.findOne({ email });
            if (!employee) {
                return res.status(403).json({ message: "Access denied. Employee record not found." });
            }
            return res.status(200).json({ message: "Employee login successful.", token });
        } else {
            return res.status(403).json({ message: "Invalid role." });
        }


        // res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};